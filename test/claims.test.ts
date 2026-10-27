import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { checkText, findingsOf } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';
import { LIMITS } from '../src/core/limits';
import type { FileKind, FileReport, Finding } from '../src/core/types';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { FIXTURES, fixtureFetch, fixtureFile, type RecordedRequest } from './helpers';

async function check(name: string, kind: FileKind, pro = false): Promise<FileReport> {
  const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0, sleep: async () => undefined });
  return checkText(name, fixtureFile(name), kind, { crossref, pro });
}

function forEntry(report: FileReport, id: string): Finding[] {
  return findingsOf(report).filter((finding) => finding.entryId === id);
}

describe('claim register P1-P4 (BibTeX fixture)', () => {
  test('P1: flags a reference whose DOI does not resolve in Crossref (unregistered-DOI fixture)', async () => {
    const report = await check('claims.bib', 'bibtex');
    const [finding, ...rest] = forEntry(report, 'unregistered2024');
    assert.equal(rest.length, 0);
    assert.equal(finding.kind, 'doi-not-found');
    assert.equal(finding.claim, 'P1');
    assert.match(finding.message, /does not resolve in Crossref/);
    assert.ok(finding.evidence.some((item) => item.url === 'https://api.crossref.org/works/10.5555/cite-ledger-unregistered-0000'));
    assert.ok(finding.evidence.some((item) => item.url === 'https://doi.org/10.5555/cite-ledger-unregistered-0000'));
    assert.match(finding.couldBeWrong, /DataCite/);
  });

  test('P2: flags a retraction and a correction recorded by Retraction Watch (known retracted DOI fixture)', async () => {
    const report = await check('claims.bib', 'bibtex');
    const findings = forEntry(report, 'wakefield1998');
    const retraction = findings.find((finding) => finding.kind === 'retraction');
    const correction = findings.find((finding) => finding.kind === 'correction');
    assert.ok(retraction, 'retraction flagged');
    assert.ok(correction, 'correction flagged');
    assert.equal(retraction.claim, 'P2');
    assert.equal(retraction.severity, 'error');
    assert.match(retraction.message, /Retraction recorded in Crossref .*10\.1016\/s0140-6736\(10\)60175-4/);
    assert.match(retraction.message, /Retraction Watch/);
    assert.equal(retraction.evidence[0].url, 'https://doi.org/10.1016/s0140-6736(10)60175-4');
    assert.equal(correction.claim, 'P2');
    assert.equal(findings.length, 2, 'no title, year or author finding: the RETRACTED prefix is not a mismatch');
  });

  test('P2: flags an expression of concern recorded in Crossref', async () => {
    const report = await check('claims.bib', 'bibtex');
    const findings = forEntry(report, 'feng2013');
    assert.equal(findings.length, 1, 'publisher and Retraction Watch records of one notice are merged');
    assert.equal(findings[0].kind, 'expression-of-concern');
    assert.equal(findings[0].claim, 'P2');
    assert.match(findings[0].message, /Recorded by Retraction Watch and the publisher/);
    assert.equal(findings[0].evidence[0].url, 'https://doi.org/10.1371/journal.pone.0278805');
  });

  test('P3: shows where the title, year and first author differ from the Crossref record (mismatch fixture)', async () => {
    const report = await check('claims.bib', 'bibtex');
    const findings = forEntry(report, 'lecun_mismatch');
    const byKind = new Map(findings.map((finding) => [finding.kind, finding]));
    assert.deepEqual([...byKind.keys()].sort(), ['first-author-differs', 'title-differs', 'year-differs']);
    for (const finding of findings) {
      assert.equal(finding.claim, 'P3');
      assert.ok(finding.fileValue && finding.crossrefValue, 'both values shown');
    }
    assert.equal(byKind.get('title-differs')?.crossrefValue, 'Deep learning');
    assert.equal(byKind.get('title-differs')?.fileValue, 'Neural networks for everything');
    assert.equal(byKind.get('year-differs')?.fileValue, '2016');
    assert.equal(byKind.get('year-differs')?.crossrefValue, '2015');
    assert.equal(byKind.get('first-author-differs')?.fileValue, 'Hinton');
    assert.equal(byKind.get('first-author-differs')?.crossrefValue, 'LeCun');
  });

  test('P4: marks a reference with no matching Crossref record as unverified (free, no closest match)', async () => {
    const report = await check('claims.bib', 'bibtex', false);
    const [finding, ...rest] = forEntry(report, 'fabricated2023');
    assert.equal(rest.length, 0);
    assert.equal(finding.kind, 'unverified');
    assert.equal(finding.claim, 'P4');
    assert.equal(finding.message, 'Unverified: no matching Crossref record found.');
    assert.equal(finding.closestMatch, undefined);
    assert.match(finding.evidence[0].url, /^https:\/\/api\.crossref\.org\/works\?query\.bibliographic=/);
  });

  test('P4 Pro: shows the closest match for an unverified reference', async () => {
    const report = await check('claims.bib', 'bibtex', true);
    const [finding] = forEntry(report, 'fabricated2023');
    assert.equal(finding.kind, 'unverified');
    assert.ok(finding.closestMatch, 'closest match present');
    assert.match(finding.message, /Closest match: /);
    assert.ok(finding.evidence.some((item) => item.url === finding.closestMatch?.url));
  });

  test('P4: a reference without a DOI that search confirms is not marked unverified', async () => {
    const report = await check('claims.bib', 'bibtex');
    assert.deepEqual(forEntry(report, 'lecun2015'), []);
    const result = report.results.find((item) => item.entry.id === 'lecun2015');
    assert.equal(result?.status, 'matched');
    assert.equal(result?.crossrefDoi, '10.1038/nature14539');
  });

  test('a web entry without a DOI is not looked up', async () => {
    const report = await check('claims.bib', 'bibtex');
    assert.equal(report.results.find((item) => item.entry.id === 'website')?.status, 'skipped');
  });
});

describe('DOIs registered outside Crossref (L1)', () => {
  test('a DOI the agency lookup names as DataCite gets an info finding that names the agency and points to L1, not a warning', async () => {
    const report = await check('agency.bib', 'bibtex');
    for (const [id, doi] of [['kingma2014', '10.48550/arxiv.1412.6980'], ['zenodo2017', '10.5281/zenodo.591564']]) {
      const [finding, ...rest] = forEntry(report, id);
      assert.equal(rest.length, 0, id);
      assert.equal(finding.kind, 'other-agency');
      assert.equal(finding.claim, 'P1');
      assert.equal(finding.severity, 'info');
      assert.match(finding.message, /is registered with DataCite, not Crossref\. .*\(L1\)\.$/);
      assert.deepEqual(finding.evidence.map((item) => item.url), [`https://api.crossref.org/works/${doi}/agency`, `https://doi.org/${doi}`]);
      assert.equal(report.results.find((result) => result.entry.id === id)?.status, 'other-agency');
    }
    assert.ok(findingsOf(report).every((finding) => finding.severity !== 'warning'));
  });

  test('a DOI the agency lookup answers 404 for keeps the P1 warning and says it may be mistyped', async () => {
    const report = await check('claims.bib', 'bibtex');
    const [finding] = forEntry(report, 'unregistered2024');
    assert.equal(finding.severity, 'warning');
    assert.match(finding.couldBeWrong, /agency lookup found no registration agency.*mistyped/);
  });

  function agencyAnswer(answer: () => Promise<Response>) {
    const fixtures = fixtureFetch();
    return createCrossrefClient({
      fetch: (input, init) => (new URL(input).pathname.endsWith('/agency') ? answer() : fixtures(input, init)),
      minIntervalMs: 0,
      retries: 1,
      sleep: async () => undefined,
    });
  }

  async function expectP1Warnings(crossref: ReturnType<typeof createCrossrefClient>): Promise<void> {
    const report = await checkText('agency.bib', fixtureFile('agency.bib'), 'bibtex', { crossref, pro: false });
    for (const id of ['kingma2014', 'zenodo2017']) {
      const [finding, ...rest] = forEntry(report, id);
      assert.equal(rest.length, 0);
      assert.equal(finding.kind, 'doi-not-found');
      assert.equal(finding.claim, 'P1');
      assert.equal(finding.severity, 'warning');
      assert.match(finding.message, /does not resolve in Crossref/);
      assert.match(finding.couldBeWrong, /DataCite/);
    }
  }

  test('when the agency lookup answers 5xx after retries, the result falls back to the P1 warning', async () => {
    await expectP1Warnings(agencyAnswer(async () => new Response('busy', { status: 503 })));
  });

  test('when the agency lookup cannot reach Crossref, the result falls back to the P1 warning', async () => {
    await expectP1Warnings(agencyAnswer(async () => {
      throw new Error('socket hang up');
    }));
  });

  test('an agency of crossref with no work record keeps the P1 warning', async () => {
    await expectP1Warnings(agencyAnswer(async () => new Response(JSON.stringify({ status: 'ok', message: { agency: { id: 'crossref', label: 'Crossref' } } }))));
  });
});

describe('LaTeX and Markdown fixtures', () => {
  test('LaTeX thebibliography: P2 on the retracted DOI, a confirmed short title, and P4 on the unmatched item', async () => {
    const report = await check('claims.tex', 'latex');
    assert.deepEqual(forEntry(report, 'wakefield').map((finding) => finding.kind).sort(), ['correction', 'retraction']);
    assert.deepEqual(forEntry(report, 'lecun'), []);
    assert.deepEqual(forEntry(report, 'fake').map((finding) => finding.kind), ['unverified']);
    assert.deepEqual(report.notes, ['References for this file are in extra.bib. Open extra.bib and check it there.']);
  });

  test('Markdown: P1 and P4 in the reference list; P2 only for a DOI in prose', async () => {
    const report = await check('claims.md', 'markdown');
    const kinds = (line: number) => forEntry(report, `line ${line}`).map((finding) => finding.kind).sort();
    assert.deepEqual(kinds(9), ['correction', 'retraction'], 'inline DOI in prose: update notices only');
    assert.deepEqual(kinds(17), [], 'LeCun 2015 matches its Crossref record');
    assert.deepEqual(kinds(18), ['doi-not-found']);
    assert.deepEqual(kinds(19), ['unverified']);
    assert.equal(report.results.length, 4, 'the DOI in a code fence is ignored');
  });
});

describe('arXiv preprints without a DOI (L1)', () => {
  async function checkArxiv(name: string, kind: FileKind, pro = false, recorded: RecordedRequest[] = []): Promise<FileReport> {
    const crossref = createCrossrefClient({ fetch: fixtureFetch(recorded), minIntervalMs: 0, sleep: async () => undefined });
    return checkText(name, readFileSync(path.join(FIXTURES, 'arxiv', name), 'utf8'), kind, { crossref, pro });
  }

  function expectArxivMessage(findings: Finding[], id: string): void {
    const [finding, ...rest] = findings;
    assert.equal(rest.length, 0);
    assert.equal(finding.kind, 'unverified');
    assert.equal(finding.claim, 'P4');
    assert.equal(finding.severity, 'info');
    assert.equal(finding.message, `Unverified: no matching Crossref record found. This entry is the arXiv preprint arXiv:${id}, whose DOI is registered with DataCite, which Cite Ledger does not check (L1).`);
    assert.doesNotMatch(finding.message, /fabricated/i);
    assert.match(finding.evidence[0].url, /^https:\/\/api\.crossref\.org\/works\?query\.bibliographic=/);
    assert.ok(finding.evidence.some((item) => item.url === `https://doi.org/10.48550/arXiv.${id}`));
    assert.match(finding.couldBeWrong, /does not mean the preprint is fabricated \(L3\)/);
    assert.match(finding.couldBeWrong, /DataCite/);
    assert.deepEqual(finding.limits, LIMITS);
  }

  test('BibTeX: eprint with archivePrefix or eprinttype arXiv, and arXiv:NNNN.NNNNN in journal or note, get the arXiv message', async () => {
    const report = await checkArxiv('arxiv.bib', 'bibtex');
    expectArxivMessage(forEntry(report, 'kingma2014'), '1412.6980');
    expectArxivMessage(forEntry(report, 'vaswani2017'), '1706.03762');
    expectArxivMessage(forEntry(report, 'he2015'), '1512.03385');
    expectArxivMessage(forEntry(report, 'devlin2018'), '1810.04805');
  });

  test('the search still runs, once per entry, and a match it finds is reported as before', async () => {
    const recorded: RecordedRequest[] = [];
    const report = await checkArxiv('arxiv.bib', 'bibtex', false, recorded);
    assert.equal(recorded.length, report.results.length, 'one request per entry, nothing new');
    assert.ok(recorded.every((request) => new URL(request.url).pathname === '/works' && new URL(request.url).searchParams.has('query.bibliographic')));
    assert.deepEqual(forEntry(report, 'lecun2015arxiv'), []);
    const result = report.results.find((item) => item.entry.id === 'lecun2015arxiv');
    assert.equal(result?.status, 'matched');
    assert.equal(result?.crossrefDoi, '10.1038/nature14539');
  });

  test('a passing mention of arXiv, with no identifier, keeps the general unverified text', async () => {
    const report = await checkArxiv('arxiv.bib', 'bibtex');
    const [finding] = forEntry(report, 'passing2020');
    assert.equal(finding.message, 'Unverified: no matching Crossref record found.');
    assert.match(finding.couldBeWrong, /preprints and web pages often have none \(L3\)/);
    assert.equal(finding.evidence.length, 1);
  });

  test('Pro: the closest match and the arXiv message are both shown', async () => {
    const report = await checkArxiv('arxiv.bib', 'bibtex', true);
    const [finding] = forEntry(report, 'kingma2014');
    assert.match(finding.message, /Closest match: .* This entry is the arXiv preprint arXiv:1412\.6980, whose DOI is registered with DataCite/);
  });

  test('LaTeX thebibliography and Markdown reference lists are handled the same way', async () => {
    const tex = await checkArxiv('arxiv.tex', 'latex');
    expectArxivMessage(forEntry(tex, 'kingma2014'), '1412.6980');
    assert.equal(forEntry(tex, 'passing2020')[0].message, 'Unverified: no matching Crossref record found.');
    assert.equal(tex.results.find((item) => item.entry.id === 'lecun2015')?.status, 'matched');

    const md = await checkArxiv('arxiv.md', 'markdown');
    expectArxivMessage(forEntry(md, 'line 5'), '1412.6980');
    assert.equal(forEntry(md, 'line 6')[0].message, 'Unverified: no matching Crossref record found.');
    assert.equal(md.results.find((item) => item.entry.id === 'line 7')?.status, 'matched');
  });
});

describe('evidence and limits', () => {
  test('every finding links to its evidence and states limits L1-L3', async () => {
    const reports = [await check('claims.bib', 'bibtex', true), await check('claims.tex', 'latex', true), await check('claims.md', 'markdown', true), await check('agency.bib', 'bibtex', true)];
    const findings = reports.flatMap(findingsOf);
    assert.ok(findings.length >= 12);
    for (const finding of findings) {
      assert.ok(finding.evidence.length > 0, `${finding.entryId} has evidence`);
      for (const item of finding.evidence) {
        assert.match(item.url, /^https:\/\/(api\.crossref\.org|doi\.org)\//);
        assert.doesNotMatch(item.url, /mailto/);
      }
      assert.deepEqual(finding.limits.map((limit) => limit.id), ['L1', 'L2', 'L3']);
      assert.deepEqual(finding.limits, LIMITS);
      assert.ok(finding.couldBeWrong.length > 0);
    }
  });

  test('a Crossref failure is reported as not checked, never as a finding about the reference', async () => {
    const crossref = createCrossrefClient({
      fetch: async () => new Response('busy', { status: 503 }),
      minIntervalMs: 0,
      retries: 1,
      sleep: async () => undefined,
    });
    const report = await checkText('claims.bib', fixtureFile('claims.bib'), 'bibtex', { crossref, pro: false });
    const findings = findingsOf(report);
    assert.ok(findings.length > 0);
    assert.ok(findings.every((finding) => finding.kind === 'lookup-failed' && finding.claim === undefined));
    assert.ok(findings.every((finding) => /Nothing is concluded/.test(finding.message)));
  });
});

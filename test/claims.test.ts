import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { checkText, findingsOf } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';
import { LIMITS } from '../src/core/limits';
import type { FileKind, FileReport, Finding } from '../src/core/types';
import { fixtureFetch, fixtureFile } from './helpers';

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

describe('evidence and limits', () => {
  test('every finding links to its evidence and states limits L1-L3', async () => {
    const reports = [await check('claims.bib', 'bibtex', true), await check('claims.tex', 'latex', true), await check('claims.md', 'markdown', true)];
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

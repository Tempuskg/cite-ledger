import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { checkText, findingsOf } from '../src/core/checker';
import { createCrossrefClient, firstAuthorOfWork, type CrossrefWork, type Fetch } from '../src/core/crossref';
import { fixtureFetch } from './helpers';
import { renderReport } from '../src/core/report';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function clientFor(handlers: {
  readonly work?: CrossrefWork;
  readonly search?: readonly CrossrefWork[];
}): ReturnType<typeof createCrossrefClient> {
  const fetch: Fetch = async (input) => {
    const url = new URL(input);
    assert.equal(url.hostname, 'api.crossref.org');
    if (url.pathname === '/works') {
      return json({ message: { items: handlers.search ?? [] } });
    }
    if (handlers.work && url.pathname.toLowerCase() === `/works/${handlers.work.DOI.toLowerCase()}`) {
      return json({ status: 'ok', message: handlers.work });
    }
    return new Response('Resource not found.', { status: 404 });
  };
  return createCrossrefClient({ fetch, minIntervalMs: 0, sleep: async () => undefined });
}

const orgReport: CrossrefWork = {
  DOI: '10.2172/2585515',
  title: ['Review of Grey Box/Black Box Data Contamination Metrics on Open and Commercial Models'],
  author: [{ name: 'US Department of Homeland Security (DHS)', sequence: 'first' }],
  issued: { 'date-parts': [[2025]] },
  published: { 'date-parts': [[2025]] },
  'published-print': { 'date-parts': [[2025]] },
};

const onlineOnly: CrossrefWork = {
  DOI: '10.1038/s41551-024-01284-6',
  title: ['Simple and effective embedding model for single-cell biology built from ChatGPT'],
  author: [{ given: 'Yiqun', family: 'Chen', sequence: 'first' }],
  issued: { 'date-parts': [[2024]] },
  published: { 'date-parts': [[2024]] },
  'published-online': { 'date-parts': [[2024]] },
};

describe('confident Crossref matches: organisation authors and online-versus-print years', () => {
  test('a Crossref organisation first author does not raise first-author-differs on a DOI check', async () => {
    const bib = `@techreport{osti,
  author = {Casalnuovo, C.},
  title  = {Review of Grey Box/Black Box Data Contamination Metrics on Open and Commercial Models},
  year   = {2025},
  doi    = {10.2172/2585515}
}`;
    const report = await checkText('org.bib', bib, 'bibtex', { crossref: clientFor({ work: orgReport }), pro: false });
    const findings = findingsOf(report);
    assert.equal(findings.length, 0);
    assert.equal(report.results[0]?.status, 'verified');
  });

  test('a Crossref organisation first author does not block a confident search match', async () => {
    const bib = `@techreport{osti,
  author = {Casalnuovo, C.},
  title  = {Review of Grey Box/Black Box Data Contamination Metrics on Open and Commercial Models},
  year   = {2025}
}`;
    const report = await checkText('org.bib', bib, 'bibtex', { crossref: clientFor({ search: [orgReport] }), pro: false });
    assert.equal(report.results[0]?.status, 'matched');
    assert.equal(report.results[0]?.crossrefDoi, '10.2172/2585515');
    assert.equal(findingsOf(report).length, 0);
  });

  test('a one-year online-versus-print gap is not year-differs; could-be-wrong still explains larger gaps', async () => {
    const onlineYear = `@article{chen,
  author = {Chen, Yiqun},
  title  = {Simple and effective embedding model for single-cell biology built from ChatGPT},
  year   = {2025},
  doi    = {10.1038/s41551-024-01284-6}
}`;
    const ok = await checkText('online.bib', onlineYear, 'bibtex', { crossref: clientFor({ work: onlineOnly }), pro: false });
    assert.equal(ok.results[0]?.status, 'verified');
    assert.equal(findingsOf(ok).length, 0);

    const farYear = `@article{chen,
  author = {Chen, Yiqun},
  title  = {Simple and effective embedding model for single-cell biology built from ChatGPT},
  year   = {2020},
  doi    = {10.1038/s41551-024-01284-6}
}`;
    const far = await checkText('far.bib', farYear, 'bibtex', { crossref: clientFor({ work: onlineOnly }), pro: false });
    const [finding] = findingsOf(far);
    assert.equal(finding.kind, 'year-differs');
    assert.match(finding.couldBeWrong, /Print, online and conference years can differ/);
    assert.match(finding.couldBeWrong, /one-year gap is treated as online versus print/);
  });

  test('a one-year online-versus-print gap does not block a confident search match', async () => {
    const bib = `@article{chen,
  author = {Chen, Yiqun},
  title  = {Simple and effective embedding model for single-cell biology built from ChatGPT},
  year   = {2025}
}`;
    const report = await checkText('online.bib', bib, 'bibtex', { crossref: clientFor({ search: [onlineOnly] }), pro: false });
    assert.equal(report.results[0]?.status, 'matched');
    assert.equal(report.results[0]?.crossrefDoi, '10.1038/s41551-024-01284-6');
  });
});

describe('authors of retracted or questioned works stay out of findings', () => {
  function assertNoAuthorNames(message: string, crossrefAuthor: string | undefined, fileAuthor: string): void {
    assert.match(message, /First author differs from the Crossref record/);
    assert.match(message, /open the evidence link to compare/);
    assert.doesNotMatch(message, /\bCrossref:\s/);
    assert.doesNotMatch(message, new RegExp(`\\b${fileAuthor}\\b`, 'i'));
    if (crossrefAuthor) {
      assert.doesNotMatch(message, new RegExp(`\\b${crossrefAuthor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));
    }
  }

  test('first-author-differs on a retracted DOI does not name the Crossref or file author', async () => {
    const doi = '10.1016/S0140-6736(97)11096-0';
    const bib = `@article{retracted,
  author = {Example, Ann},
  title  = {Ileal-lymphoid-nodular hyperplasia, non-specific colitis, and pervasive developmental disorder in children},
  year   = {1998},
  doi    = {${doi}}
}`;
    const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0, sleep: async () => undefined });
    const report = await checkText('retracted.bib', bib, 'bibtex', { crossref, pro: false });
    const authorFinding = findingsOf(report).find((finding) => finding.kind === 'first-author-differs');
    assert.ok(authorFinding, 'placeholder author should differ from the Crossref record');
    assert.equal(authorFinding.fileValue, undefined);
    assert.equal(authorFinding.crossrefValue, undefined);
    const workLookup = await crossref.getWork(doi);
    assert.equal(workLookup.status, 'found');
    assertNoAuthorNames(authorFinding.message, firstAuthorOfWork(workLookup.work), 'Example');
    assert.ok(findingsOf(report).some((finding) => finding.kind === 'retraction'));
  });

  test('first-author-differs on an expression of concern does not name the Crossref or file author', async () => {
    const doi = '10.1371/journal.pone.0061107';
    const bib = `@article{concern,
  author = {Example, Ann},
  title  = {Impairment of FOS mRNA Stabilization Following Translation Arrest in Granulocytes from Myelodysplastic Syndrome Patients},
  year   = {2013},
  doi    = {${doi}}
}`;
    const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0, sleep: async () => undefined });
    const report = await checkText('concern.bib', bib, 'bibtex', { crossref, pro: false });
    const authorFinding = findingsOf(report).find((finding) => finding.kind === 'first-author-differs');
    assert.ok(authorFinding, 'placeholder author should differ from the Crossref record');
    assert.equal(authorFinding.fileValue, undefined);
    assert.equal(authorFinding.crossrefValue, undefined);
    const workLookup = await crossref.getWork(doi);
    assert.equal(workLookup.status, 'found');
    assertNoAuthorNames(authorFinding.message, firstAuthorOfWork(workLookup.work), 'Example');
    assert.ok(findingsOf(report).some((finding) => finding.kind === 'expression-of-concern'));
  });

  test('a Pro closest match for a questioned work omits firstAuthor', async () => {
    const questioned: CrossrefWork = {
      DOI: '10.5555/cite-ledger-questioned-0001',
      title: ['Quantum entanglement kinetics of sourdough starter colonies under lunar gravity'],
      author: [{ given: 'Secret', family: 'Surname', sequence: 'first' }],
      issued: { 'date-parts': [[2023]] },
      'updated-by': [{ DOI: '10.5555/cite-ledger-questioned-notice', type: 'retraction', label: 'Retraction' }],
    };
    const bib = `@article{fabricated2023,
  author  = {Zzyzxqar, Q.},
  title   = {Quantum entanglement kinetics of sourdough starter colonies under lunar gravity},
  journal = {Journal of Improbable Fermentation},
  year    = {2023}
}`;
    const report = await checkText('fabricated.bib', bib, 'bibtex', { crossref: clientFor({ search: [questioned] }), pro: true });
    const [finding] = findingsOf(report);
    assert.equal(finding.kind, 'unverified');
    assert.ok(finding.closestMatch);
    assert.equal(finding.closestMatch.firstAuthor, undefined);
    assert.doesNotMatch(finding.message, /Surname/);
  });
});

describe('corrections-only author privacy', () => {
  for (const type of ['correction', 'erratum', 'corrigendum']) {
    const work: CrossrefWork = {
      DOI: '10.5555/privacy-corrected',
      title: ['A synthetic study of reference checking'],
      author: [{ family: 'RecordSurname', sequence: 'first' }],
      issued: { 'date-parts': [[2023]] },
      'updated-by': [{ DOI: '10.5555/privacy-notice', type }],
    };

    for (const kind of ['bibtex', 'markdown'] as const) {
      test(`${type}: ${kind} first-author finding retains evidence but omits names in all report formats`, async () => {
        const text = kind === 'bibtex'
          ? `@article{privacy, author={FileSurname, Ann}, title={A synthetic study of reference checking}, year={2023}, doi={${work.DOI}}}`
          : `# References\n\n- FileSurname (2023). A synthetic study of reference checking. https://doi.org/${work.DOI}`;
        const report = await checkText('privacy', text, kind, { crossref: clientFor({ work }), pro: true });
        const findings = findingsOf(report);
        const authorFinding = findings.find((item) => item.kind === 'first-author-differs');
        assert.ok(authorFinding);
        assert.match(authorFinding.message, /open the evidence link to compare/);
        assert.doesNotMatch(JSON.stringify(authorFinding), /RecordSurname|FileSurname/);
        assert.equal(authorFinding.fileValue, undefined);
        assert.equal(authorFinding.crossrefValue, undefined);
        assert.ok(authorFinding.evidence.some((item) => item.url.includes('api.crossref.org')));
        assert.deepEqual(authorFinding.limits.map((limit) => limit.id), ['L1', 'L2', 'L3']);
        assert.ok(authorFinding.couldBeWrong);
        assert.ok(findings.some((item) => item.kind === 'correction'));
        assert.ok(!findings.some((item) => item.kind === 'retraction' || item.kind === 'expression-of-concern'));
        for (const format of ['md', 'csv', 'json'] as const) {
          const output = renderReport([report], format, { version: 'test', generatedAt: new Date(0) });
          assert.doesNotMatch(output, /RecordSurname/);
          assert.match(output, /First author differs from the Crossref record/);
        }
      });
    }

    test(`${type}: Pro closest match omits the record author`, async () => {
      const text = '@article{privacy, author={FileSurname, Ann}, title={A synthetic study of reference checking}, year={2023}}';
      const report = await checkText('privacy.bib', text, 'bibtex', { crossref: clientFor({ search: [work] }), pro: true });
      const [finding] = findingsOf(report);
      assert.equal(finding.kind, 'unverified');
      assert.ok(finding.closestMatch);
      assert.equal(finding.closestMatch.firstAuthor, undefined);
      assert.doesNotMatch(JSON.stringify(finding), /RecordSurname/);
    });
  }
});

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { checkText } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';
import { parseReferences } from '../src/core/parse';
import { checkResultMessage, findingLines, firstFinding, SHOW_FINDINGS, SHOW_LIMITS, SHOW_OUTPUT } from '../src/core/summary';
import type { FileReport } from '../src/core/types';
import { fixtureFetch, fixtureFile } from './helpers';

describe('result message after a check', () => {
  async function claimsReport(): Promise<FileReport> {
    const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0 });
    return checkText('refs/claims.bib', fixtureFile('claims.bib'), 'bibtex', { crossref, pro: false });
  }

  function cleanReport(): FileReport {
    const entries = parseReferences('@article{a, doi = {10.1000/a}}\n@article{b, doi = {10.1000/b}}\n', 'bibtex').entries;
    return { file: 'clean.bib', kind: 'bibtex', notes: [], results: entries.map((entry) => ({ entry, status: 'verified', findings: [] })) };
  }

  test('a check with findings offers Show Findings and Show Output, and names the kinds found', async () => {
    const report = await claimsReport();
    const result = checkResultMessage([report]);
    assert.ok(result.findings > 0);
    assert.deepEqual(result.actions, [SHOW_FINDINGS, SHOW_OUTPUT]);
    assert.match(result.text, /^Cite Ledger: \d+ findings in 7 references in refs\/claims\.bib \(.*retraction.*\)\.$/);
  });

  test('a DOI registered outside Crossref is counted apart from DOI not found', async () => {
    const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0 });
    const report = await checkText('refs/agency.bib', fixtureFile('agency.bib'), 'bibtex', { crossref, pro: false });
    const result = checkResultMessage([report]);
    assert.equal(result.text, 'Cite Ledger: 2 findings in 2 references in refs/agency.bib (2 DOIs registered outside Crossref).');
    assert.ok(findingLines(report).every((line) => line.includes('[P1 other-agency]')));
  });

  test('a check with 0 findings says nothing was found and how many references were checked', () => {
    const result = checkResultMessage([cleanReport()]);
    assert.equal(result.findings, 0);
    assert.equal(result.text, 'Cite Ledger: no problems found in 2 references in clean.bib, checked against Crossref.');
    assert.deepEqual(result.actions, [SHOW_OUTPUT, SHOW_LIMITS]);
    assert.ok(!result.actions.includes(SHOW_FINDINGS));
  });

  test('a file with no references says so', () => {
    const result = checkResultMessage([{ file: 'empty.md', kind: 'markdown', notes: [], results: [] }]);
    assert.equal(result.text, 'Cite Ledger found no references to check in empty.md.');
    assert.deepEqual(result.actions, [SHOW_OUTPUT]);
  });

  test('a workspace check counts files and uses singular forms for one', () => {
    const one = cleanReport();
    const single = { ...one, results: one.results.slice(0, 1) };
    assert.equal(checkResultMessage([single, { ...single, file: 'other.bib' }]).text, 'Cite Ledger: no problems found in 2 references in 2 files, checked against Crossref.');
    assert.equal(checkResultMessage([single]).text, 'Cite Ledger: no problems found in 1 reference in clean.bib, checked against Crossref.');
  });

  test('output lines and Show Findings point at the file and line of each finding', async () => {
    const report = await claimsReport();
    const lines = findingLines(report);
    const findings = report.results.flatMap((result) => result.findings);
    assert.equal(lines.length, findings.length);
    assert.ok(lines.every((line) => /^ {2}refs\/claims\.bib:\d+ /.test(line)));
    const first = firstFinding(report);
    assert.ok(first);
    assert.equal(first.startLine, Math.min(...findings.map((finding) => finding.startLine)));
  });
});

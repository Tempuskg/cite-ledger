import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { checkText } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';
import { LIMITS } from '../src/core/limits';
import { renderReport } from '../src/core/report';
import { fixtureFetch, fixtureFile } from './helpers';

describe('exportable report', () => {
  async function reports() {
    const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0 });
    return [await checkText('refs/claims.bib', fixtureFile('claims.bib'), 'bibtex', { crossref, pro: true })];
  }
  const meta = { version: '0.1.0', generatedAt: new Date('2026-10-19T12:00:00Z') };

  test('Markdown, CSV and JSON reports carry evidence links and limits L1-L3', async () => {
    const files = await reports();
    for (const format of ['md', 'csv', 'json'] as const) {
      const text = renderReport(files, format, meta);
      assert.match(text, /https:\/\/doi\.org\/10\.1016\/s0140-6736\(10\)60175-4/, format);
      assert.match(text, /https:\/\/api\.crossref\.org\/works\/10\.5555\/cite-ledger-unregistered-0000/, format);
      for (const limit of LIMITS) {
        assert.ok(text.includes(limit.text.replace(/"/g, format === 'csv' ? '""' : '"')), `${format} states ${limit.id}`);
      }
    }
  });

  test('Markdown report summarises the run', async () => {
    const text = renderReport(await reports(), 'md', meta);
    assert.match(text, /^# Cite Ledger report/);
    assert.match(text, /7 references in 1 file\(s\): 3 found by DOI, 1 matched by search, 1 DOI not found, 1 unverified, 1 not looked up, 0 not checked\./);
  });

  test('CSV quotes cells with commas and quotes', async () => {
    const csv = renderReport(await reports(), 'csv', meta);
    const titleRow = csv.split('\r\n').find((line) => line.includes('title-differs'));
    assert.ok(titleRow);
    assert.match(titleRow, /"Title differs from the Crossref record for 10\.1038\/nature14539\. File: ""Neural networks for everything""\./);
  });
});

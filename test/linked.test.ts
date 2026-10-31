import assert from 'node:assert/strict';
import * as path from 'node:path';
import { describe, test } from 'node:test';
import { main, type CliDeps } from '../src/cli';
import { checkWithLinkedFiles } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';
import { parseLatex } from '../src/core/latex';
import { FIXTURES, fixtureFetch, polarResponder, type RecordedRequest } from './helpers';

const LINKED = path.join(FIXTURES, 'linked');
const BENEFIT = 'test-benefit-0000';

function cli(recorded: RecordedRequest[], licensed = false): { deps: CliDeps; out: string[] } {
  const out: string[] = [];
  return {
    out,
    deps: {
      fetch: fixtureFetch(recorded, licensed ? polarResponder({ status: 200, body: { status: 'granted', benefit_id: BENEFIT } }) : undefined),
      env: {},
      stdout: (text) => out.push(text),
      stderr: (text) => out.push(text),
      crossrefMinIntervalMs: 0,
      polarBenefitId: BENEFIT,
    },
  };
}

describe('.bib files a .tex file names', () => {
  test('the LaTeX parser lists \\bibliography and \\addbibresource files, adds .bib only when missing, and ignores comments', () => {
    assert.deepEqual(parseLatex('\\bibliography{main, refs/extra,missing}\n% \\bibliography{commented}').bibFiles, ['main.bib', 'refs/extra.bib', 'missing.bib']);
    const biblatex = parseLatex('\\addbibresource{main.bib}\n\\addbibresource[label=x]{refs/extra.bib}\n%\\addbibresource{commented.bib}\n\\addbibresource[location=remote]{https://example.org/remote.bib}');
    assert.deepEqual(biblatex.bibFiles, ['main.bib', 'refs/extra.bib']);
    assert.deepEqual(biblatex.notes, ['References for this file are at https://example.org/remote.bib. Cite Ledger reads only local files, so they were not checked.']);
    assert.deepEqual(parseLatex('\\bibliography{a}\\addbibresource{a.bib}').bibFiles, ['a.bib'], 'a file named twice is listed once');
  });

  test('checking a .tex file resolves each named .bib relative to it and reports findings on the .bib file', async () => {
    const crossref = createCrossrefClient({ fetch: fixtureFetch(), minIntervalMs: 0, sleep: async () => undefined });
    const read: string[] = [];
    const reports = await checkWithLinkedFiles('papers/paper.tex', '\\bibliography{main,refs/extra}', 'latex', { crossref, pro: false }, {
      resolve: (from, name) => path.posix.join(path.posix.dirname(from), name),
      read: async (file) => {
        read.push(file);
        return file === 'papers/main.bib'
          ? '@article{a, title = {A placeholder}, year = {2024}, doi = {10.5555/cite-ledger-unregistered-0000}}'
          : undefined;
      },
    });
    assert.deepEqual(read, ['papers/main.bib', 'papers/refs/extra.bib']);
    assert.deepEqual(reports.map((report) => report.file), ['papers/paper.tex', 'papers/main.bib']);
    assert.deepEqual(reports[0].notes, ['References for this file are in refs/extra.bib, which was not found. It was not checked.']);
    assert.deepEqual(reports[1].results.flatMap((result) => result.findings.map((finding) => finding.kind)), ['doi-not-found']);
  });

  test('a free CLI check of a .tex file checks its .bib files, prints the .bib path and line, and notes a missing file', async () => {
    const recorded: RecordedRequest[] = [];
    const { deps, out } = cli(recorded);
    const tex = path.join(LINKED, 'paper.tex');
    assert.equal(await main(['check', tex], deps), 0);
    const text = out.join('');
    assert.ok(text.includes(`${path.join(LINKED, 'main.bib')}:3 placeholder_unregistered [P1 doi-not-found]`), text);
    assert.ok(text.includes(`${path.join(LINKED, 'refs', 'extra.bib')}:3 placeholder_unmatched [P4 unverified]`), text);
    assert.ok(text.includes(`${tex}: References for this file are in missing.bib, which was not found. It was not checked.`), text);
    assert.doesNotMatch(text, /commented/);
    assert.match(text, /Checked 2 references in 3 file\(s\)/);
    assert.deepEqual([...new Set(recorded.map((request) => new URL(request.url).hostname))], ['api.crossref.org']);
  });

  test('\\addbibresource with the extension and a subfolder resolves the same way', async () => {
    const { deps, out } = cli([]);
    assert.equal(await main(['check', path.join(LINKED, 'biblatex.tex')], deps), 0);
    const text = out.join('');
    assert.ok(text.includes(`${path.join(LINKED, 'main.bib')}:3 placeholder_unregistered`), text);
    assert.ok(text.includes(`${path.join(LINKED, 'refs', 'extra.bib')}:3 placeholder_unmatched`), text);
    assert.doesNotMatch(text, /not found/);
  });

  test('a Pro workspace scan checks each .bib file once, whether reached directly or through a .tex file', async () => {
    const recorded: RecordedRequest[] = [];
    const { deps, out } = cli(recorded, true);
    assert.equal(await main(['check', LINKED, '--license-key', 'KEY-123'], deps), 0);
    const text = out.join('');
    assert.match(text, /Checked 2 references in 4 file\(s\)/, 'biblatex.tex, main.bib, paper.tex and refs/extra.bib, each once');
    assert.equal(text.split('placeholder_unregistered [P1 doi-not-found]').length - 1, 1);
    assert.equal(text.split('placeholder_unmatched [P4 unverified]').length - 1, 1);
    const workLookups = recorded.filter((request) => new URL(request.url).pathname === '/works/10.5555%2Fcite-ledger-unregistered-0000' || new URL(request.url).pathname === '/works/10.5555/cite-ledger-unregistered-0000');
    assert.equal(workLookups.length, 1, 'the DOI in main.bib is looked up once');
  });
});

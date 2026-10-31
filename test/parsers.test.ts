import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, test } from 'node:test';
import { parseBibtex } from '../src/core/bibtex';
import { parseLatex } from '../src/core/latex';
import { parseMarkdown } from '../src/core/markdown';
import { arxivIdIn, extractDois, firstAuthorFamily, normalizeDoi, stripUpdatePrefix, titleSimilarity } from '../src/core/normalize';
import { kindForFile } from '../src/core/parse';
import { FIXTURES, fixtureFile } from './helpers';

describe('BibTeX parser', () => {
  test('reads entries, fields, DOIs and lines from the fixture', () => {
    const { entries } = parseBibtex(fixtureFile('claims.bib'));
    assert.deepEqual(entries.map((entry) => entry.id), ['wakefield1998', 'feng2013', 'unregistered2024', 'lecun_mismatch', 'lecun2015', 'fabricated2023', 'website']);
    const wakefield = entries[0];
    assert.equal(wakefield.doi, '10.1016/s0140-6736(97)11096-0');
    assert.equal(wakefield.year, 1998);
    assert.equal(wakefield.firstAuthorFamily, 'Wakefield');
    assert.equal(wakefield.startLine, 5);
    assert.equal(wakefield.endLine, 12);
    assert.equal(entries[1].title, 'Impairment of FOS mRNA Stabilization Following Translation Arrest in Granulocytes from Myelodysplastic Syndrome Patients');
    assert.equal(entries[1].year, 2013);
    assert.equal(entries[2].doi, '10.5555/cite-ledger-unregistered-0000');
    assert.equal(entries[5].title, 'Quantum entanglement kinetics of sourdough starter colonies under lunar gravity');
    assert.ok(entries[6].skipReason);
  });

  test('handles nested braces, concatenation, parentheses and DOIs in url fields', () => {
    const { entries } = parseBibtex(`@book(knuth, author = "Knuth, Donald E.", title = {The {\\TeX}book}, year = 1984)
@misc{x, title = "A" # " title", url = {https://doi.org/10.1000/abc(1)}, journal={J}}
@inproceedings{y, author = {{World Health Organization}}, title = {Report}, booktitle = {Proc}}`);
    assert.equal(entries.length, 3);
    assert.equal(entries[0].firstAuthorFamily, 'Knuth');
    assert.equal(entries[0].title, 'The book');
    assert.equal(entries[1].title, 'A title');
    assert.equal(entries[1].doi, '10.1000/abc(1)');
    assert.equal(entries[2].firstAuthorFamily, 'World Health Organization');
  });
});

describe('LaTeX parser', () => {
  test('reads thebibliography items, \\doi and ignores comments', () => {
    const { entries, notes, bibFiles } = parseLatex(fixtureFile('claims.tex'));
    assert.deepEqual(entries.map((entry) => entry.id), ['wakefield', 'lecun', 'fake']);
    assert.equal(entries[0].doi, '10.1016/s0140-6736(97)11096-0');
    assert.equal(entries[1].doi, undefined);
    assert.equal(entries[0].startLine, 4);
    assert.match(entries[1].rawText, /Deep learning/);
    assert.deepEqual(notes, []);
    assert.deepEqual(bibFiles, ['extra.bib']);
  });
});

describe('Markdown parser', () => {
  test('reads the References section, inline DOIs in prose, and skips code fences', () => {
    const { entries, notes } = parseMarkdown(fixtureFile('claims.md'));
    assert.deepEqual(entries.map((entry) => [entry.id, entry.inReferenceList, entry.doi ?? null]), [
      ['line 9', false, '10.1016/s0140-6736(97)11096-0'],
      ['line 17', true, '10.1038/nature14539'],
      ['line 18', true, '10.5555/cite-ledger-unregistered-0000'],
      ['line 19', true, null],
    ]);
    assert.equal(entries[3].endLine, 19);
    assert.match(entries[3].queryText, /under lunar gravity/);
    assert.ok(entries.every((entry) => !entry.rawText.includes('SENTINEL')));
    assert.deepEqual(notes, ['References for this file are in refs.bib. Open it and check it there.']);
  });

  test('reads each table row in a reference section as its own entry, and keeps every DOI', () => {
    const { entries, notes } = parseMarkdown(readFileSync(path.join(FIXTURES, 'parsers', 'table.md'), 'utf8'));
    assert.deepEqual(entries.map((entry) => [entry.id, entry.inReferenceList, entry.doi ?? null]), [
      ['line 7', true, '10.5555/cite-ledger-list-0001'],
      ['line 8', true, '10.5555/cite-ledger-list-0002'],
      ['line 8', false, '10.5555/cite-ledger-list-0003'],
      ['line 12', true, '10.1038/nature14539'],
      ['line 13', true, '10.5555/cite-ledger-unregistered-0000'],
      ['line 14', true, null],
      ['line 15', true, '10.5555/cite-ledger-table-0004'],
      ['line 17', true, '10.5555/cite-ledger-list-0005'],
    ]);
    assert.ok(entries.every((entry) => entry.startLine === entry.endLine));
    assert.ok(entries.every((entry) => !/Topic|---|\|/.test(entry.rawText)));
    assert.match(entries[3].queryText, /Deep learning/);
    assert.equal(entries[5].skipReason, undefined);
    assert.deepEqual(notes, ['The reference at line 8 holds 2 DOIs. Each is checked, but only the first is compared with the reference text.']);
  });

  test('never drops a further DOI in a reference block', () => {
    const text = ['## References', '', '1. Example, A. (2020). A first work. 10.5555/a-0001', '   Its companion work. 10.5555/a-0002', '   Its data. 10.5555/a-0003'].join('\n');
    const { entries } = parseMarkdown(text);
    assert.deepEqual(entries.map((entry) => [entry.id, entry.doi]), [
      ['line 3', '10.5555/a-0001'],
      ['line 4', '10.5555/a-0002'],
      ['line 5', '10.5555/a-0003'],
    ]);
  });
});

describe('normalization', () => {
  test('reads an arXiv identifier only when it is written as arXiv:NNNN.NNNNN', () => {
    assert.equal(arxivIdIn('arXiv:1412.6980'), '1412.6980');
    assert.equal(arxivIdIn('Preprint, arXiv: 1706.03762v7.'), '1706.03762');
    assert.equal(arxivIdIn('ARXIV:0704.0001'), '0704.0001');
    assert.equal(arxivIdIn('See also arXiv for a later version'), undefined);
    assert.equal(arxivIdIn('arXiv preprint 1412.6980'), undefined);
    assert.equal(arxivIdIn('arXiv:1412.698012'), undefined);
  });

  test('BibTeX: eprint is an arXiv identifier only with archivePrefix or eprinttype arXiv', () => {
    const ids = parseBibtex([
      '@misc{a, title = {A}, eprint = {arXiv:1412.6980v2}, archivePrefix = {arXiv}}',
      '@misc{b, title = {B}, eprint = {hep-th/9901001}, eprinttype = {arxiv}}',
      '@misc{c, title = {C}, eprint = {12345}, eprinttype = {pubmed}}',
      '@misc{d, title = {D}, note = {see also arXiv}}',
    ].join('\n')).entries.map((entry) => entry.arxivId);
    assert.deepEqual(ids, ['1412.6980', 'hep-th/9901001', undefined, undefined]);
  });

  test('extracts DOIs and keeps balanced parentheses', () => {
    assert.deepEqual(extractDois('See (doi:10.1000/xyz). And https://doi.org/10.1016/S0140-6736(97)11096-0, then 10.1234/a.b;'), [
      '10.1000/xyz',
      '10.1016/s0140-6736(97)11096-0',
      '10.1234/a.b',
    ]);
    assert.equal(normalizeDoi('https://dx.doi.org/10.1000%2FABC'), '10.1000/abc');
    assert.equal(normalizeDoi('not a doi'), undefined);
  });

  test('strips update prefixes and compares titles', () => {
    assert.equal(stripUpdatePrefix('RETRACTED: Ileal-lymphoid-nodular hyperplasia'), 'Ileal-lymphoid-nodular hyperplasia');
    assert.equal(titleSimilarity('The {D}eep Learning', 'Deep learning'), 1);
    assert.equal(firstAuthorFamily('Yann LeCun and Others'), 'LeCun');
    assert.equal(firstAuthorFamily('M{\\"u}ller, J.'), 'Muller');
  });

  test('maps file names to kinds', () => {
    assert.equal(kindForFile('refs.BIB'), 'bibtex');
    assert.equal(kindForFile('paper.tex'), 'latex');
    assert.equal(kindForFile('notes.qmd'), 'markdown');
    assert.equal(kindForFile('main.py'), undefined);
  });
});

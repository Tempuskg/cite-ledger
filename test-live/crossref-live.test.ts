import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { checkText, findingsOf } from '../src/core/checker';
import { createCrossrefClient } from '../src/core/crossref';

/**
 * Runs the claim fixtures against the real Crossref API (weekly in CI, workflow crossref-live.yml).
 * A failure means Crossref's data or format changed: the P-claims it backs must not be used in
 * marketing until it passes again (standing instruction, stop condition 2).
 */
const crossref = createCrossrefClient({
  ...(process.env.CROSSREF_MAILTO ? { mailto: process.env.CROSSREF_MAILTO } : {}),
  userAgent: 'CiteLedger-live-test (https://github.com/Tempuskg/cite-ledger)',
});

const BIB = `@article{retracted, author = {Wakefield, A. J.}, year = {1998}, doi = {10.1016/S0140-6736(97)11096-0},
  title = {Ileal-lymphoid-nodular hyperplasia, non-specific colitis, and pervasive developmental disorder in children}}
@article{concern, author = {Feng, Xiaomin}, year = {2013}, doi = {10.1371/journal.pone.0061107},
  title = {Impairment of FOS mRNA Stabilization Following Translation Arrest in Granulocytes from Myelodysplastic Syndrome Patients}}
@article{unregistered, author = {Example, Ann}, title = {Unregistered}, year = {2024}, doi = {10.5555/cite-ledger-unregistered-0000}}
@article{mismatch, author = {Hinton, Geoffrey}, title = {Neural networks for everything}, year = {2016}, doi = {10.1038/nature14539}}
@article{matched, author = {LeCun, Yann}, title = {Deep learning}, journal = {Nature}, year = {2015}}
@article{fabricated, author = {Zzyzxqar, Q.}, title = {Quantum entanglement kinetics of sourdough starter colonies under lunar gravity}, journal = {Journal of Improbable Fermentation}, year = {2023}}`;

describe('live Crossref', () => {
  test('claim fixtures still hold against api.crossref.org', async () => {
    const report = await checkText('live.bib', BIB, 'bibtex', { crossref, pro: true });
    const kinds = (id: string) => findingsOf(report).filter((finding) => finding.entryId === id).map((finding) => finding.kind).sort();
    assert.ok(kinds('retracted').includes('retraction'), 'P2 retraction');
    assert.ok(kinds('concern').includes('expression-of-concern'), 'P2 expression of concern');
    assert.deepEqual(kinds('unregistered'), ['doi-not-found'], 'P1');
    assert.deepEqual(kinds('mismatch'), ['first-author-differs', 'title-differs', 'year-differs'], 'P3');
    assert.deepEqual(kinds('matched'), [], 'P4 confirmed by search');
    assert.deepEqual(kinds('fabricated'), ['unverified'], 'P4 unverified');
    assert.ok(findingsOf(report).every((finding) => finding.kind !== 'lookup-failed'), 'no lookup failed');
  });
});

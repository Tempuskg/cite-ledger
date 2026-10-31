---
id: card-mvwbw2ni-1
title: Stop Markdown link and emphasis syntax from becoming part of a DOI
column: col-mvfa2glc-1
position: 5000
createdAt: 1793446752148
updatedAt: 1793446752148
---

## Description
In the baseline, 74 of 75 "DOI does not resolve" findings came from Markdown files, and every one sampled was a valid DOI with Markdown or URL syntax stuck to its end. Examples of the trailing text: `](https://doi.org/...)` when the DOI is a link's text, `)_**`, `*`, `.svg)](...)` from badges, `)."`, `.pdf`, and a bioRxiv `v1` path suffix. `DOI_PATTERN` in `src/core/normalize.ts` stops only at whitespace and quotes, and `trimDoi` removes only unbalanced closing brackets at the very end.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [ ] A DOI written as a Markdown link's text, `[10.x/y](https://doi.org/10.x/y)`, is read as `10.x/y`.
- [ ] Trailing emphasis markers, badge image suffixes and closing curly quotes are not part of the DOI. Fixture tests cover each form seen in the baseline.
- [ ] Rerunning the baseline shows how many Markdown "DOI does not resolve" findings remain.
- [ ] `npm run check` passes.

## Activity

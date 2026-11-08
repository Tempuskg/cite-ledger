---
id: card-mw8anibc-2
title: Prepare release 0.1.2 with the findings-quality and author-name fixes
column: col-mvfa2glc-1
position: 2000
createdAt: 1794170267256
updatedAt: 1794170267256
---

## Description
Raised by the weekly operations run on `card-mw72euz3-2` (2026-11-08). The fixes from `card-mvwbw2ni-1` to `-5` (Markdown DOI parsing, LaTeX `\bibinfo`, Crossref public-pool limits, non-reference Markdown content, group authors and online-versus-print years) and `card-mw72euz3-1` (no author names in first-author findings on retracted, questioned or corrected works) are all marked done, but they sit uncommitted in the working tree and users still run 0.1.1. The runbook expects an agent to prepare a release on a product-board card once defects are fixed.

Prepare the release short of publishing: commit the changes, bump the version, write the `CHANGELOG.md` entry within the claim register, and run `npm run check` and `npm run test:live`. Pushing the `v*` tag is Darren's approval.

## Acceptance criteria
- [ ] The fixes are committed to `main` with `npm run check` passing in CI.
- [ ] The version and `CHANGELOG.md` entry are ready, using accepted claims only.
- [ ] `npm run test:live` passes against the release candidate.
- [ ] Darren has approved or declined the tag; no tag is pushed without his approval.

## Activity

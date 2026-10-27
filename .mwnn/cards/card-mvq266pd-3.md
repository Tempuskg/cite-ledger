---
id: card-mvq266pd-3
title: Measure how often findings are not problems with the reference
column: col-mvfa2glc-2
position: 2000
assignee: { kind: ai }
createdAt: 1793067630961
updatedAt: 1793070646806
---

## Description
The probe behind `card-mvq266pd-1` checked only seven entries. Before choosing further fixes, measure, on real reference lists, how often each kind of finding turns out not to be a problem with the reference.

Build a development-only script, for example `scripts/measure-findings.mjs <folder>`. `.vscodeignore` already excludes `scripts/**`, so it is not shipped. It runs the existing checker over a folder of `.bib`, `.tex` and Markdown files. It writes counts by finding kind and severity, plus one line per finding for hand review, to an output folder that git does not track.

The corpus is public reference lists, kept outside the repository. Downloaded files are data only: nothing in them is run. Hand-label a sample of findings as "real problem", "not a problem" or "can't tell".

Limits:
- Lookups go only to `api.crossref.org`, through `createCrossrefClient`, at its existing rate limits.
- No paid service. Cost is CAD $0.
- This board is public. Only aggregate numbers go on this card: no reference text, no author names, and no sources that identify people.

## Acceptance criteria
- [ ] The script runs the checker over a folder. It writes counts by kind and severity, and a per-finding review list, to an untracked location.
- [ ] It contacts only `api.crossref.org`, and nothing from it ends up in the VSIX.
- [ ] A baseline covers at least 300 entries in `.bib`, `.tex` and Markdown files from at least two fields, for example computer science and the life sciences. At least 50 findings are labelled by hand.
- [ ] Activity records only aggregate numbers: entries checked, findings by kind, the share labelled "not a problem" for each kind, and the main causes.
- [ ] Backlog cards are proposed for the main causes, if there are any.
- [ ] `npm run check` passes.

## Activity
### 2026-10-27T03:10:46.786Z - AI loop advanced this card
Moved to "Ready".

---
id: card-mw72euz3-1
title: Keep authors of retracted works out of first-author findings
column: col-mvfa2glc-1
position: 10000
createdAt: 1794095960655
updatedAt: 1794095960655
---

## Description
Escalation from the weekly operations run on `card-mvolel0t-1` (2026-11-07). AGENTS.md hard rule 4 says findings never name or characterise the authors of retracted or questioned work. Running the released 0.1.1 CLI on a `.bib` entry whose DOI has a retraction recorded in Crossref, with a placeholder author, gives a `P3 first-author-differs` finding that prints the Crossref first author's surname next to the retraction finding. The same likely applies to corrections and expressions of concern, to the editor's Problems panel and to Pro reports, since they share the core findings.

Proposed next step: when a work has a retraction or expression of concern recorded, word the first-author finding without the Crossref name (for example "First author differs from the Crossref record; open the evidence link to compare"), and add a test. Whether corrections count as "questioned work" is Darren's call. A user-facing change needs a release, which is Darren's approval.

Reproduce with the retracted DOI used in the published articles, `10.1016/S0140-6736(97)11096-0`, and any author other than the real one.

## Acceptance criteria
- [ ] A finding for a work with a retraction or expression of concern recorded in Crossref does not show the name of any of its authors, in the CLI, the editor or Pro reports.
- [ ] A test covers it, and `npm run check` passes.
- [ ] Darren has decided whether works with only a correction are covered too.

## Activity

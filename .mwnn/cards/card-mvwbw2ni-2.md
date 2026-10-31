---
id: card-mvwbw2ni-2
title: Read LaTeX bibinfo fields without their field names
column: col-mvfa2glc-1
position: 6000
createdAt: 1793446752148
updatedAt: 1793446752148
---

## Description
Bibliographies made by natbib-style `.bst` files (for example Springer Nature and revtex) write `\bibinfo{author}{Surname, A.}` and `\bibinfo{title}{...}`. The LaTeX parser leaves the field name in the text, so the Crossref query reads `authorSurname, A. ... titleFirstword ...`. In the baseline about 132 "Unverified" findings in two such files came from this cause. Sampled ones had an exact Crossref record as the closest match, which was rejected.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [ ] `\bibinfo{<field>}{<value>}` contributes only `<value>` to the query and comparison text.
- [ ] A fixture `\bibitem` in this style matches its Crossref record.
- [ ] Rerunning the baseline shows the change in "Unverified" findings for LaTeX files.
- [ ] `npm run check` passes.

## Activity

---
id: card-mvwbw2ni-5
title: Accept confident Crossref matches with group authors and online-versus-print years
column: col-mvfa2glc-1
position: 9000
createdAt: 1793446752148
updatedAt: 1793446752148
dependsOn: [card-mvwbw2ni-2]
---

## Description
102 "Unverified" findings in the baseline had a closest Crossref match with title similarity of 0.9 or more. Sampled cases include a group or consortium first author in Crossref, and journal articles whose cited year is the issue year while Crossref holds only the online year. A separate cause of these misses is covered by the LaTeX bibinfo card. Of 7 year-differs findings, 6 sampled were online-versus-print differences of one year. Of 8 first-author-differs findings, one was a report with an organisation as Crossref author. Do this after the bibinfo card, so the remaining misses can be measured on their own.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [ ] A first author that is a group or organisation in Crossref does not by itself block a confident match or raise first-author-differs.
- [ ] How one-year online-versus-print differences are handled is decided and tested, and the could-be-wrong text still explains it.
- [ ] Rerunning the baseline reports the change in "Unverified" and year-differs findings.
- [ ] `npm run check` passes.

## Activity

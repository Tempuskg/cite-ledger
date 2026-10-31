---
id: card-mvwbw2ni-4
title: Ignore non-reference content in Markdown reference sections
column: col-mvfa2glc-1
position: 8000
createdAt: 1793446752148
updatedAt: 1793446752148
---

## Description
Several Markdown findings in the baseline were not about references at all. These patterns caused them:
- Link reference definitions (`[label]: https://...`) were read as references, or merged into the last list item with other references' DOIs.
- In `<a href="...">Name et al.</a>` anchors, `stripUrls` swallowed the text after the URL, so a first author who is named was reported missing.
- A pipeline step list under a heading starting with "References" and lists of GitHub links were looked up as works.
Each gave "Unverified", title-differs or first-author-differs findings that were not problems with the reference.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [ ] Link reference definitions are not references and are not merged into the item above them.
- [ ] `stripUrls` stops at the end of a URL inside an HTML attribute, so the anchor text stays.
- [ ] Items that are only a link with no bibliographic text, or an imperative step list, are skipped with a reason. Fixture tests cover each pattern.
- [ ] No existing claim test changes its result.
- [ ] `npm run check` passes.

## Activity

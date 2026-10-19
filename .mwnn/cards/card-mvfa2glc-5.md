---
id: card-mvfa2glc-5
title: Prepare the 0.1.0 release
column: col-mvfa2glc-1
position: 2000
assignee: { kind: ai }
createdAt: 1792415841150
updatedAt: 1792415841150
dependsOn: [card-mvfa2glc-1, card-mvfa2glc-3]
---

## Description
Get the first release ready, short of publishing it. It needs the Polar product and benefit id (`card-mvfa2glc-1`) and Darren's claim review (`card-mvfa2glc-3`).

Steps:
1. Set `POLAR_BENEFIT_ID`.
2. Record the P6 product URL.
3. Add the P6 line, with the price quoted from the live Polar page, to the README and the product page.
4. Add any newly accepted claims, word for word.
5. Finalise `CHANGELOG.md`.
6. Make sure `package.json` is at 0.1.0.
7. Install the packaged VSIX in a clean editor profile, and check one free file and one Pro workspace scan with a real key.

Do not tag or publish. That is the launch, `card-mvfa2glc-6`.

## Acceptance criteria
- [ ] `npm run check` and `npm run test:live` pass on the release commit.
- [ ] The README, product page and listing use only accepted claims, and P6 carries the live Polar price.
- [ ] A packaged VSIX was installed and run once free and once with a Pro key. The results are recorded in Activity, without the key.

## Activity

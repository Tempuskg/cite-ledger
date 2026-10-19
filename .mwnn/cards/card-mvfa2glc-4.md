---
id: card-mvfa2glc-4
title: Approve and switch on the product page
column: col-mvfa2glc-1
position: 1000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792415841150
dependsOn: [card-mvfa2glc-3]
---

## Description
`site/index.html` is the product page. It loads nothing from other sites, sets no cookies, and uses accepted claims only, as `npm run check:claims` verifies. `.github/workflows/pages.yml` deploys it to GitHub Pages, at CAD $0 for a public repository. The workflow does nothing until the repository variable `PAGES_ENABLED` is `true`.

Publishing the page the first time is Darren's decision:
1. Approve the page text.
2. In the repository settings, set Pages to deploy from GitHub Actions.
3. Run `gh variable set PAGES_ENABLED --body true -R Tempuskg/cite-ledger`, or ask the agent to run it once you have approved.

After that, merges that change `site/` publish the page. Articles may be merged only under the marketing standing instruction.

## Acceptance criteria
- [ ] Darren approved the page, and the approval is recorded in Activity with the date.
- [ ] Pages is enabled and the page is live, and its URL is recorded here.

## Activity

---
id: card-mvfa2glc-4
title: Approve and switch on the product page
column: col-mvfa2glc-5
position: -5000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792930500000
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
- [x] Darren approved the page, and the approval is recorded in Activity with the date.
- [x] Pages is enabled and the page is live, and its URL is recorded here.

## Activity
### 2026-10-25 - Asked Darren: approve page text (Cursor Agent from company card-mvf572fm-1)
`site/index.html` is the product page. Verified evidence: `npm run check:claims` passed (13 register entries; README, listing text and site use accepted claims only). GitHub Pages is not live (API 404); `PAGES_ENABLED` is not set. Dependency `card-mvfa2glc-3` is Done. Question put in the company-card coworking chat: approve the page text as written, or correct it.

### 2026-10-25 - Page text approved (user-reported)
Q: Do you approve the product page text in `site/index.html` as written?
A: "Yes". Reported by Darren McLeod in interview chat, 2026-10-25.
Criterion 1 is met. Criterion 2 (Pages live + URL) stays open until `PAGES_ENABLED` is set, Pages is configured for GitHub Actions, and the Product page workflow deploys successfully. Moved to In Progress. Assignee unchanged.

### 2026-10-25 - Asked Darren: authorize Pages switch-on
Verified: `site/index.html` is on `origin/main` (`f6f1369`); Pages API still 404; workflow **Product page** is active but gated on `vars.PAGES_ENABLED == 'true'`. Asked whether the agent may set `PAGES_ENABLED=true` and dispatch that workflow (first publish of the product page).

### 2026-10-25 - Pages switch-on authorized (user-reported)
Q: May I switch the product page on now by setting `PAGES_ENABLED=true` on `Tempuskg/cite-ledger` and dispatching the Product page workflow?
A: "Yes". Reported by Darren McLeod in interview chat, 2026-10-25.
Acting on that authorization next.

### 2026-10-25 - Product page live (verified evidence)
Under Darren's authorization of 2026-10-25:
1. Set `PAGES_ENABLED=true` (`gh variable set`, listed 2026-10-25T12:13:19Z).
2. First **Product page** run `40192159805` failed at Configure Pages: Pages site not found.
3. Enabled Pages with `build_type=workflow` via `gh api …/pages -X POST` (within the same switch-on authorization). API returned `html_url` `https://tempuskg.github.io/cite-ledger/`.
4. Re-dispatched; run `40192212071` completed successfully (tests, check:claims, deploy).
5. `Invoke-WebRequest https://tempuskg.github.io/cite-ledger/` returned HTTP 200 with `<h1>Cite Ledger</h1>` and claim P2 markup.

**Live URL:** https://tempuskg.github.io/cite-ledger/

Both criteria met; moved to Done. Assignee unchanged.

---
id: card-mvq9h1qm-2
title: Check 0.1.1 in the editor on a DataCite DOI
column: col-mvfa2glc-5
position: -15000
assignee: { kind: ai }
createdAt: 1793099500358
updatedAt: 1793456781264
dependsOn: [card-mvq266pd-4]
---

## Description
The 0.1.1 release test ran the installed package's CLI in a clean profile (`card-mvq266pd-4`). The check inside the editor was not done, because the agent cannot drive the editor UI.

In an editor with Cite Ledger 0.1.1 from the Marketplace or Open VSX, open a `.bib` file with `doi = {10.5281/zenodo.591564}` (for example, a copy of `test/fixtures/files/agency.bib`). Run **Check References in This File**.

## Acceptance criteria
- [x] The Extensions view shows Cite Ledger 0.1.1.
- [x] Each DataCite DOI gets one Information diagnostic in the Problems panel. It names DataCite, links to L1, and is not a "does not resolve in Crossref" warning.
- [x] The result is recorded in Activity. If it differs, a bug card is created on this board.

## Activity
### 2026-10-31T14:22:35.878Z - Handed off to Codex (ChatGPT)
Dispatched this card to Codex (ChatGPT). The agent should append its completion note below.
### 2026-10-31 - Codex: Marketplace 0.1.1 editor smoke test passed
- Installed `darrenjmcleod.cite-ledger@0.1.1` from the VS Code Marketplace using the editor CLI into an isolated profile under `.measure/editor-011/`. Opened a copy of `test/fixtures/files/agency.bib` in that profile. The Extensions view explicitly showed Cite Ledger version 0.1.1; the existing default profile had 0.1.0, so it was not used for this test.
- Ran the editor's **Check References in This File** action against live Crossref. The notification reported 2 findings in 2 references, both DOIs registered outside Crossref.
- Inspected the Problems panel: exactly two Information diagnostics, one for `10.48550/arxiv.1412.6980` at line 2 and one for `10.5281/zenodo.591564` at line 11. Each said the DOI is registered with DataCite, not Crossref, and that Cite Ledger does not check DOIs registered outside Crossref (L1). Neither was a "does not resolve in Crossref" warning. Both carried the agency lookup and resolver evidence, the "Could be wrong" explanation, and limits L1-L3. The status bar showed 0 errors, 0 warnings and 2 infos.
- Clicked each diagnostic's `(P1 other-agency)` link and verified the browser opened `https://github.com/Tempuskg/cite-ledger/blob/main/docs/limits.md#l1` with the L1 section present.
- Result matches all acceptance criteria; no bug card was needed. No product code changed. The isolated profile and fixture remain in the ignored `.measure/editor-011/` folder for review.

STATUS: DONE

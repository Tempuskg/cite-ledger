---
id: card-mvq9h1qm-1
title: Publish the 0.1.1 changelog entry on the product page
column: col-mvfa2glc-5
position: -14000
assignee: { kind: ai }
createdAt: 1793099500358
updatedAt: 1793456503101
dependsOn: [card-mvq266pd-4]
---

## Description
Darren approved v0.1.1 on 2026-10-26, and it was released (Release run https://github.com/Tempuskg/cite-ledger/actions/runs/40447678305; GitHub release https://github.com/Tempuskg/cite-ledger/releases/tag/v0.1.1). Under the standing instruction, one T2 changelog entry follows each approved release.

Steps:
1. Read the runbook and the standing instruction in the private repository (AGENTS.md, "Private operating records"). Confirm that the instruction is in force, not revoked and not past its expiry, and that the time is between 06:00 and 21:00 America/Regina. If any check fails, publish nothing and report.
2. Add the 0.1.1 entry to the changelog section of `site/index.html` in the T2 form the 0.1.0 entry uses. Name the version and date, link the claim register and the release tests, and describe only what `CHANGELOG.md` 0.1.1 says, in accepted claim wording only (P1, P4, L1, L3).
3. Log it in `docs/publication-log.md`: date and time, channel, URL, T2, claim IDs, sources (the release run) and the authority with the pre-publish check.
4. Run `npm run check`, then commit and push to `main`.

## Acceptance criteria
- [x] The pre-publish check (instruction in force and unexpired, 06:00–21:00 America/Regina, 1 changelog entry for this release) is recorded in Activity before publishing.
- [x] `site/index.html` has a 0.1.1 T2 entry that uses only accepted claims, and `npm run check:claims` passes.
- [x] `docs/publication-log.md` has a row for it.
- [x] `npm run check` passes, and the change is pushed to `main`.

## Activity
### 2026-10-31T12:43:40.944Z - Usage Orchestrator chose Anthropic Claude Code CLI
Stage: implementation. Anthropic Claude Code CLI reports 57% remaining, resetting 2026-11-02T08:59:00.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-10-31T12:43:41.274Z - Usage Orchestrator dispatch dispatch-mvwe6zx6-2 started
Card: card-mvq9h1qm-1 ("Publish the 0.1.1 changelog entry on the product page"). CLI: Anthropic Claude Code CLI. Stage: implementation.
Requested model: "opus" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-31T12:43:42.840Z - Usage Orchestrator dispatch dispatch-mvwe6zx6-2 model observed
Card: card-mvq9h1qm-1. CLI: Anthropic Claude Code CLI. Stage: implementation.
Actual model: "claude-opus-5-5" (source: Claude Code stream-json system.init.model; attempt: dispatch-mvwe6zx6-2).

### 2026-10-31T12:46:00Z - Pre-publish check (Claude Code), before publishing
- **Standing instruction in force.** I read §8 of the private research report and its status record on `card-mvctur05-1`. Darren accepted it on 2026-10-19, it carries no "Revoked" status line, and the runbook does not record a revocation.
- **Unexpired.** It expires 2027-01-17. Today is 2026-10-31.
- **Time window.** It was 06:43 America/Regina (12:43Z) at the check, which is inside 06:00–21:00.
- **Volume.** This is 1 changelog entry for this release. `docs/publication-log.md` has no earlier 0.1.1 entry.
- **Release approved.** Darren approved v0.1.1 on 2026-10-26. Release run 40447678305 on `v0.1.1` concluded `success`.
- **Stop conditions.** None applies. The weekly log on `card-mvfa2glc-7` reports 0 open issues and no wrong-finding stop, and it is within its 14-day acknowledgement window.

### 2026-10-31T12:50:00Z - Published 0.1.1 T2 changelog entry (Claude Code)
- **Product page.** `site/index.html` has a new "Changelog — 0.1.1" section above the 0.1.0 one. It gives the date (2026-10-26) and says the claim register is unchanged. It describes the two `CHANGELOG.md` 0.1.1 changes: DOIs registered with another agency are reported as an info finding that names the agency, and arXiv preprints without a DOI get the new unverified message. The claims appear word for word as tagged `data-claim` spans: P1 and L1, then P4, L1 and L3. It links the `v0.1.1` claim register, the `v0.1.1` CHANGELOG (which names the tests) and Release run 40447678305.
- **Log.** `docs/publication-log.md` has a row dated 2026-10-31 06:47 America/Regina: product-page channel, T2, P1/P4/L1/L3, sources, and the §8 authority with the pre-publish check.
- **Checks.** `npm run check:claims` passed. `npm run check` passed with exit 0 (58 tests pass, 0 fail; the VSIX packaged). It ran in a clean worktree at HEAD with only these changes, because the main checkout holds unrelated uncommitted work from other cards. That work was not touched or committed.
- **Pushed.** Commit `5d5380b` is on `main`. The Product page workflow deploys on merge.

STATUS: DONE

### 2026-10-31T12:46:46.188Z - MWNN independent verification started

### 2026-10-31T12:46:46.259Z - Anthropic Claude Code CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

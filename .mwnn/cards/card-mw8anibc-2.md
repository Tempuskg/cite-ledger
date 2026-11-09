---
id: card-mw8anibc-2
title: Prepare release 0.1.2 with the findings-quality and author-name fixes
column: col-mvfa2glc-3
position: 1000
assignee: { kind: ai }
createdAt: 1794170267256
updatedAt: 1794184731522
---

## Description
Raised by the weekly operations run on `card-mw72euz3-2` (2026-11-08). The fixes from `card-mvwbw2ni-1` to `-5` (Markdown DOI parsing, LaTeX `\bibinfo`, Crossref public-pool limits, non-reference Markdown content, group authors and online-versus-print years) and `card-mw72euz3-1` (no author names in first-author findings on retracted, questioned or corrected works) are all marked done, but they sit uncommitted in the working tree and users still run 0.1.1. The runbook expects an agent to prepare a release on a product-board card once defects are fixed.

Prepare the release short of publishing: commit the changes, bump the version, write the `CHANGELOG.md` entry within the claim register, and run `npm run check` and `npm run test:live`. Pushing the `v*` tag is Darren's approval.

## Acceptance criteria
- [x] The fixes are committed to `main` with `npm run check` passing in CI.
- [x] The version and `CHANGELOG.md` entry are ready, using accepted claims only.
- [x] `npm run test:live` passes against the release candidate.
- [ ] Darren has approved or declined the tag; no tag is pushed without his approval.

## Activity
### 2026-11-09T00:34:27.505Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-09T00:34:27.884Z - Usage Orchestrator dispatch dispatch-mw8j3vl8-2 started
Card: card-mw8anibc-2 ("Prepare release 0.1.2 with the findings-quality and author-name fixes"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-09T00:34:30.646Z - Usage Orchestrator dispatch dispatch-mw8j3vl8-2 model observed
Card: card-mw8anibc-2. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw8j3vl8-2).

### 2026-11-09T00:38:51Z - Cursor Agent CLI: 0.1.2 prepared, not tagged
- **What ships.** `card-mvwbw2ni-1`–`-5`, `card-mw72euz3-1`, and `card-mw8anibc-3` (notice-specific could-be-wrong text, already Done in the same tree), plus the deferred `.tex`→`.bib` check from Unreleased (`card-mvq266pd-2`).
- **Commits on `main` (pushed):**
  - `24ae2a3`: findings-quality and author-name fixes.
  - `af56e01`: release prep. `package.json` / `package-lock.json` at 0.1.2 (`npm version 0.1.2 --no-git-tag-version`). `CHANGELOG.md` has dated "0.1.2 (2026-11-08)" naming each change with claims and tests. Claim register unchanged; listing text unchanged.
- **Checks.** Local `npm run check` exit 0 (86 tests, claims, `cite-ledger-0.1.2.vsix`). `npm run test:live` exit 0 against `api.crossref.org`. CI on `main` run 42541246951: success.
- **No tag.** `git tag -l` has no `v0.1.2`. T2 product-page changelog waits until after an approved release.
- **Darren: do you approve pushing `v0.1.2`?** On a yes: tag `af56e01` as `v0.1.2` and push the tag (runs `release.yml`). On a no: leave untagged; users stay on 0.1.1 until a later decision.

STATUS: BLOCKED: waiting for Darren to approve or decline pushing v0.1.2

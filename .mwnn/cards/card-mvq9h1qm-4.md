---
id: card-mvq9h1qm-4
title: Move the workflows off deprecated Node.js 20 actions
column: col-mvfa2glc-5
position: -11000
assignee: { kind: human }
createdAt: 1793099900000
updatedAt: 1793103945192
---

## Description
The v0.1.1 Release run (https://github.com/Tempuskg/cite-ledger/actions/runs/40447678305) had two annotations:
- "Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4, softprops/action-gh-release@v2."
- "The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026."

The four workflows use these actions:
- `ci.yml`, `crossref-live.yml`, `release.yml`: `actions/checkout@v4`, `actions/setup-node@v4`.
- `release.yml`: `softprops/action-gh-release@v2`.
- `pages.yml`: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
- All jobs run on `ubuntu-latest` with Node.js 22 for the build itself.

Change: move each action to its current major version that runs on Node.js 24. Check each action's release notes for breaking changes, such as new inputs or changed defaults for `setup-node` caching. Keep `ubuntu-latest`. The build already uses Node.js 22, so the Ubuntu 26 image should not matter. If a run fails on the new image, pin `ubuntu-24.04` in that job and record why.

Limits:
- Do not change what a workflow does: its triggers, its permissions, its secrets (`VSCE_PAT`, `OVSX_PAT`), or the `PAGES_ENABLED` gate. Never read or print the secrets (AGENTS.md rule 2).
- No new action or third-party dependency. Version bumps only.
- Do not push a tag or run `release.yml` to test it. Its changes are first exercised on the next release that Darren approves. Record that in Activity, and list the release-related changes so Darren can review them before that release.

## Acceptance criteria
- [x] Every action in `.github/workflows/*.yml` is at a major version that does not target Node.js 20. Activity names each version and its source (the action's release page).
- [x] Triggers, permissions, secrets and the `PAGES_ENABLED` gate are unchanged in the diff.
- [x] `npm run check` passes, and the change is pushed to `main`.
- [x] After the push, CI passes with no Node.js 20 deprecation annotation. Crossref live (run by `workflow_dispatch` if it has that trigger, otherwise at its next scheduled run) and the Pages deploy pass, or Activity records why they could not be run.
- [x] Activity lists the `release.yml` changes for Darren to review before the next release.

## Activity
### 2026-10-27T11:16:32.357Z - Usage Orchestrator chose Anthropic Claude Code CLI
Stage: implementation. Anthropic Claude Code CLI reports 96% remaining, resetting 2026-11-02T09:00:00.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-10-27T11:16:32.532Z - Usage Orchestrator dispatch dispatch-mvqlbiqc-1 started
Card: card-mvq9h1qm-4 ("Move the workflows off deprecated Node.js 20 actions"). CLI: Anthropic Claude Code CLI. Stage: implementation.
Requested model: "opus" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-27T11:16:33.808Z - Usage Orchestrator dispatch dispatch-mvqlbiqc-1 model observed
Card: card-mvq9h1qm-4. CLI: Anthropic Claude Code CLI. Stage: implementation.
Actual model: "claude-opus-5-5" (source: Claude Code stream-json system.init.model; attempt: dispatch-mvqlbiqc-1).

### 2026-10-27 - Claude Code (implementation)
Moved every workflow action to its current major version that runs on Node.js 24. This is commit e9d3335, pushed to `main`. I confirmed each version from the action's release page (`https://github.com/<action>/releases`), and from `runs.using` in its `action.yml` at that major tag:
- `actions/checkout` v4 -> **v7** (latest v7.0.1, `node24`). The v5 to v7 notes: node24, credentials persisted to a separate file, and fork PRs blocked for `pull_request_target`/`workflow_run`. None of these affect our triggers.
- `actions/setup-node` v4 -> **v7** (latest v7.1.0, `node24`). v5/v6: automatic caching only when `packageManager` is set, and only for npm. We have no `packageManager` field and keep the explicit `cache: npm`, so caching is unchanged. v7: ESM, and the dummy `NODE_AUTH_TOKEN` was removed. We don't use `registry-url`, so this doesn't affect us.
- `actions/configure-pages` v5 -> **v6** (v6.0.0, `node24`). Its only change is node24.
- `actions/upload-pages-artifact` v3 -> **v5** (v5.0.0, a composite action that uses `actions/upload-artifact` v7). v4 leaves dotfiles out of the artifact. `site/` has no dotfiles, so the artifact is unchanged.
- `actions/deploy-pages` v4 -> **v5** (latest v5.0.1, `node24`). Its only change is node24.
- `softprops/action-gh-release` v2 -> **v3** (latest v3.0.3, `node24`). v3.0.0 only moves the runtime to Node 24. Its inputs (`generate_release_notes`, `files`) are unchanged.

The diff changes only the 12 `uses:` lines. Triggers, permissions, the `VSCE_PAT`/`OVSX_PAT` steps and `if: vars.PAGES_ENABLED == 'true'` are untouched. I did not read the secrets. `runs-on: ubuntu-latest` is kept. `npm run check` passed locally (exit 0).

After the push, all three runs on e9d3335 passed:
- CI: run 40495081503 (push).
- Crossref live: run 40495090706 (`workflow_dispatch`).
- Product page: run 40495093974 (`workflow_dispatch`; it redeployed the unchanged `site/`).

None of them has a Node.js 20 deprecation annotation. The only annotation left is the notice "ubuntu-latest label will migrate to Ubuntu 26". The runner still reported `Image: ubuntu-24.04` (20261021.618), so nothing needed pinning.

**`release.yml` changes for Darren to review before the next release.** I did not push a tag or run `release.yml`, so these changes first run on the next release Darren approves:
1. `actions/checkout@v4` -> `@v7`
2. `actions/setup-node@v4` -> `@v7` (same `node-version: 22`, `cache: npm`)
3. `softprops/action-gh-release@v2` -> `@v3` (same `generate_release_notes: true` and `files`)
Nothing else changed: tag trigger, `contents: write` and both publish steps are as before. CI, Crossref live and Pages already exercise checkout@v7 and setup-node@v7 the same way. Only action-gh-release@v3 has not run yet.

STATUS: DONE

### 2026-10-27T11:19:11.969Z - Run with AI parked in Verify
Implementation finished; reassigned to Human for verification and sign-off.

---
id: card-mvwbw2ni-1
title: Stop Markdown link and emphasis syntax from becoming part of a DOI
column: col-mvfa2glc-5
position: -18000
assignee: { kind: ai }
createdAt: 1793446752148
updatedAt: 1794104520551
---

## Description
In the baseline, 74 of 75 "DOI does not resolve" findings came from Markdown files, and every one sampled was a valid DOI with Markdown or URL syntax stuck to its end. Examples of the trailing text: `](https://doi.org/...)` when the DOI is a link's text, `)_**`, `*`, `.svg)](...)` from badges, `)."`, `.pdf`, and a bioRxiv `v1` path suffix. `DOI_PATTERN` in `src/core/normalize.ts` stops only at whitespace and quotes, and `trimDoi` removes only unbalanced closing brackets at the very end.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [x] A DOI written as a Markdown link's text, `[10.x/y](https://doi.org/10.x/y)`, is read as `10.x/y`.
- [x] Trailing emphasis markers, badge image suffixes and closing curly quotes are not part of the DOI. Fixture tests cover each form seen in the baseline.
- [x] Rerunning the baseline shows how many Markdown "DOI does not resolve" findings remain.
- [x] `npm run check` passes.

## Activity
### 2026-11-08T01:59:04.750Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-08T01:59:05.119Z - Usage Orchestrator dispatch dispatch-mw76oujj-1 started
Card: card-mvwbw2ni-1 ("Stop Markdown link and emphasis syntax from becoming part of a DOI"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-08T01:59:08.745Z - Usage Orchestrator dispatch dispatch-mw76oujj-1 model observed
Card: card-mvwbw2ni-1. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw76oujj-1).

### 2026-11-08T02:21:22.208Z - Markdown DOI trailing syntax stripped
Tightened `DOI_PATTERN` in `src/core/normalize.ts` to Crossref's recommended body class so matches stop before `]`, `*`, quotes and similar. Extended `trimDoi` to drop badge `.svg` / `/status.svg`, `.pdf`, glued bioRxiv `vN` path suffixes, and leftover Markdown `_` after emphasis. Fixture test covers each baseline form. Reran `scripts/measure-findings.mjs` on the same corpus: doi-not-found 75→3; Markdown doi-not-found 74→2 (incomplete `10.1093/bioinformatics` and `10.5281/zenodo.2565517-1073c8`). `npm run check` passed (65 tests).
STATUS: DONE

### 2026-11-08T02:21:50.541Z - MWNN independent verification started

### 2026-11-08T02:21:50.601Z - Cursor Agent CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

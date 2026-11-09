---
id: card-mvwbw2ni-5
title: Accept confident Crossref matches with group authors and online-versus-print years
column: col-mvfa2glc-5
position: -22000
assignee: { kind: ai }
createdAt: 1793446752148
updatedAt: 1794148612831
dependsOn: [card-mvwbw2ni-2]
---

## Description
102 "Unverified" findings in the baseline had a closest Crossref match with title similarity of 0.9 or more. Sampled cases include a group or consortium first author in Crossref, and journal articles whose cited year is the issue year while Crossref holds only the online year. A separate cause of these misses is covered by the LaTeX bibinfo card. Of 7 year-differs findings, 6 sampled were online-versus-print differences of one year. Of 8 first-author-differs findings, one was a report with an organisation as Crossref author. Do this after the bibinfo card, so the remaining misses can be measured on their own.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [x] A first author that is a group or organisation in Crossref does not by itself block a confident match or raise first-author-differs.
- [x] How one-year online-versus-print differences are handled is decided and tested, and the could-be-wrong text still explains it.
- [x] Rerunning the baseline reports the change in "Unverified" and year-differs findings.
- [x] `npm run check` passes.

## Activity
### 2026-11-08T12:38:02.745Z - Auto-start held in Ready
Assigned to AI, but the card stays in Ready: "Ready" has 1 of its 3 defined cards (reverse WIP) and Backlog still has cards to define.

### 2026-11-08T12:52:59.217Z - Auto-start held in Ready
Assigned to AI, but the card stays in Ready: "Ready" has 1 of its 3 defined cards (reverse WIP) and Backlog still has cards to define.

### 2026-11-08T12:52:59.195Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-08T12:52:59.794Z - Usage Orchestrator dispatch dispatch-mw7u1s7m-4 started
Card: card-mvwbw2ni-5 ("Accept confident Crossref matches with group authors and online-versus-print years"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-08T12:53:02.645Z - Usage Orchestrator dispatch dispatch-mw7u1s7m-4 model observed
Card: card-mvwbw2ni-5. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw7u1s7m-4).

### 2026-11-08T13:34:18.251Z - Group authors and online-versus-print years accepted
Decision: Crossref authors with `name` and no `family` are organisations; they no longer block confident matches or raise first-author-differs. A one-year gap against Crossref years is treated as online versus print (match allowed, not reported as year-differs); larger gaps still raise year-differs, and could-be-wrong still explains print/online. P3 mismatch fixture year moved to 2010 so it remains a multi-year mismatch. Tests in `test/match.test.ts`. Baseline vs `.measure/after-public-pool` (`.measure/after-group-year`): Unverified 545→492; year-differs 7→1 (remaining gap is two years); matched 479→510; first-author-differs 10→6; high-sim (≥0.9) Unverified 77→43. `npm run check` passed (74 tests).
STATUS: DONE

### 2026-11-08T13:34:38.381Z - MWNN independent verification started

### 2026-11-08T13:34:38.431Z - Cursor Agent CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

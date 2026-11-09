---
id: card-mvwbw2ni-3
title: Keep within Crossref's public-pool limits when no mailto is set
column: col-mvfa2glc-5
position: -20000
assignee: { kind: ai }
createdAt: 1793446752148
updatedAt: 1794140663440
---

## Description
With no mailto set, the baseline's 1,437 entries gave 185 "Not checked" findings, about 13%, all after Crossref answered 429 Too Many Requests. It used the client's default concurrency of 3 and 200 ms spacing, which is also what the extension and CLI use when `citeLedger.mailto` is empty. Most users never set a mailto, so a long reference list loses checks. Choose limits from Crossref's published public- and polite-pool rules. Possible changes: lower concurrency without a mailto, longer backoff, or a summary line suggesting a mailto.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [x] Lookups without a mailto stay within Crossref's published public-pool limits. The retry policy is described in a code comment with its source.
- [x] A test covers repeated 429 answers that include Retry-After.
- [x] A baseline rerun without a mailto has at most 1% "Not checked" findings.
- [x] Only `api.crossref.org` is contacted (P5 tests unchanged and passing).
- [x] `npm run check` passes.

## Activity
### 2026-11-08T11:31:52.597Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-08T11:31:52.917Z - Usage Orchestrator dispatch dispatch-mw7r5gwl-2 started
Card: card-mvwbw2ni-3 ("Keep within Crossref's public-pool limits when no mailto is set"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-08T11:31:55.517Z - Usage Orchestrator dispatch dispatch-mw7r5gwl-2 model observed
Card: card-mvwbw2ni-3. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw7r5gwl-2).

### 2026-11-08T12:12:29.026Z - Public-pool defaults when no mailto
`createCrossrefClient` now picks defaults from Crossref's published pools (comment cites access-and-authentication and the rate-limits blog): without mailto, concurrency 1, single-record 200 ms, list queries 1000 ms; with mailto, concurrency 3, 100 ms / 334 ms. 429/5xx retries still prefer Retry-After, else exponential backoff. 429 lookup-failed findings mention setting mailto for the polite pool. Tests in `test/crossref.test.ts` cover repeated Retry-After 429s and public-pool concurrency 1. Baseline without mailto (`.measure/after-public-pool`): 63 files, 1,426 entries, 1,351 requests, 0 lookup-failed / "Not checked" (0%). P5 unchanged; `npm run check` passed (68 tests).
STATUS: DONE

### 2026-11-08T12:12:54.572Z - MWNN independent verification started

### 2026-11-08T12:12:54.636Z - Cursor Agent CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

---
id: card-mw8anibc-3
title: Word the could-be-wrong note to fit each Crossref notice type
column: col-mvfa2glc-5
position: -25000
assignee: { kind: ai }
createdAt: 1794170267256
updatedAt: 1794184439249
---

## Description
Raised by the weekly operations run on `card-mw72euz3-2` (2026-11-08). Every P2 finding (retraction, correction, expression of concern) carries the same "could be wrong" text: "The notice is what Crossref records; read it to see what it changes. A correction may leave the findings intact." (`src/core/checker.ts:123`). The second sentence fits corrections but not expressions of concern or retractions, so the note does not say how those findings could be wrong. Seen with the released 0.1.1 CLI on `10.1371/journal.pone.0061107` (expression of concern). AGENTS.md hard rule 4 asks that every finding say how it could be wrong.

The new wording must not name or characterise any author. A user-facing change needs a release, which is Darren's approval.

## Acceptance criteria
- [x] Retraction, correction and expression-of-concern findings each have could-be-wrong text that fits that notice type.
- [x] A test covers each of the three texts, and `npm run check` passes.

## Activity
### 2026-11-09T00:31:04.149Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-09T00:31:04.625Z - Usage Orchestrator dispatch dispatch-mw8izir5-1 started
Card: card-mw8anibc-3 ("Word the could-be-wrong note to fit each Crossref notice type"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-09T00:31:07.505Z - Usage Orchestrator dispatch dispatch-mw8izir5-1 model observed
Card: card-mw8anibc-3. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw8izir5-1).

### 2026-11-09T00:35:00Z - Implementation
`updateCouldBeWrong` in `src/core/checker.ts` now returns notice-specific text: retraction (what was withdrawn; wrong or later-restored notice), expression of concern (what is questioned; not a retraction), correction (unchanged: may leave findings intact). P2 tests in `test/claims.test.ts` assert each text. `npm run check` passed (86 tests). User-facing ship still needs Darren's release approval.
STATUS: DONE

### 2026-11-09T00:32:43.908Z - MWNN independent verification started

### 2026-11-09T00:32:43.966Z - Cursor Agent CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

---
id: card-mvwbw2ni-2
title: Read LaTeX bibinfo fields without their field names
column: col-mvfa2glc-5
position: -19000
assignee: { kind: ai }
createdAt: 1793446752148
updatedAt: 1794137469347
---

## Description
Bibliographies made by natbib-style `.bst` files (for example Springer Nature and revtex) write `\bibinfo{author}{Surname, A.}` and `\bibinfo{title}{...}`. The LaTeX parser leaves the field name in the text, so the Crossref query reads `authorSurname, A. ... titleFirstword ...`. In the baseline about 132 "Unverified" findings in two such files came from this cause. Sampled ones had an exact Crossref record as the closest match, which was rejected.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [x] `\bibinfo{<field>}{<value>}` contributes only `<value>` to the query and comparison text.
- [x] A fixture `\bibitem` in this style matches its Crossref record.
- [x] Rerunning the baseline shows the change in "Unverified" findings for LaTeX files.
- [x] `npm run check` passes.

## Activity
### 2026-11-08T11:09:13.385Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-08T11:09:13.786Z - Usage Orchestrator dispatch dispatch-mw7qcc6y-1 started
Card: card-mvwbw2ni-2 ("Read LaTeX bibinfo fields without their field names"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-08T11:09:16.889Z - Usage Orchestrator dispatch dispatch-mw7qcc6y-1 model observed
Card: card-mvwbw2ni-2. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw7qcc6y-1).

### 2026-11-08T11:35:00.000Z - LaTeX bibinfo field names stripped
`latexToPlain` now keeps only the value of `\bibinfo{field}{value}` (balanced braces) before stripping other commands. Fixture `lecunBibinfo` in `claims.tex` matches the Deep learning Crossref record; parser test asserts field names stay out of query/raw text. Baseline on the same corpus (`.measure/after-bibinfo`): LaTeX Unverified 193→105; the two bibinfo files 101→14 Unverified; overall matched 226→331. `npm run check` passed (66 tests).
STATUS: DONE

### 2026-11-08T11:25:48.073Z - MWNN independent verification started

### 2026-11-08T11:25:48.122Z - Cursor Agent CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

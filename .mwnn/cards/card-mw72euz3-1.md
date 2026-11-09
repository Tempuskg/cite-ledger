---
id: card-mw72euz3-1
title: Keep authors of retracted works out of first-author findings
column: col-mvfa2glc-5
position: -23000
assignee: { kind: human }
createdAt: 1794095960655
updatedAt: 1794151751335
---

## Description
Escalation from the weekly operations run on `card-mvolel0t-1` (2026-11-07). AGENTS.md hard rule 4 says findings never name or characterise the authors of retracted or questioned work. Running the released 0.1.1 CLI on a `.bib` entry whose DOI has a retraction recorded in Crossref, with a placeholder author, gives a `P3 first-author-differs` finding that prints the Crossref first author's surname next to the retraction finding. The same likely applies to corrections and expressions of concern, to the editor's Problems panel and to Pro reports, since they share the core findings.

Proposed next step: when a work has a retraction or expression of concern recorded, word the first-author finding without the Crossref name (for example "First author differs from the Crossref record; open the evidence link to compare"), and add a test. Whether corrections count as "questioned work" is Darren's call. A user-facing change needs a release, which is Darren's approval.

Reproduce with the retracted DOI used in the published articles, `10.1016/S0140-6736(97)11096-0`, and any author other than the real one.

## Acceptance criteria
- [x] A finding for a work with a retraction or expression of concern recorded in Crossref does not show the name of any of its authors, in the CLI, the editor or Pro reports.
- [x] A test covers it, and `npm run check` passes.
- [x] Darren has decided whether works with only a correction are covered too.

## Activity
### 2026-11-08T14:37:25.898Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-08T14:37:26.261Z - Usage Orchestrator dispatch dispatch-mw7xs3g5-5 started
Card: card-mw72euz3-1 ("Keep authors of retracted works out of first-author findings"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-08T14:37:30.420Z - Usage Orchestrator dispatch dispatch-mw7xs3g5-5 model observed
Card: card-mw72euz3-1. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw7xs3g5-5).

### 2026-11-08 - Cursor Agent CLI
Implemented author-name suppression for first-author findings (and Pro closest-match `firstAuthor`) when Crossref records a retraction or expression of concern. Shared core path, so CLI, editor Problems and Pro reports all get it. Wording: "First author differs from the Crossref record for {DOI}; open the evidence link to compare." with no `fileValue`/`crossrefValue`. Tests in `test/match.test.ts` (retracted fixture DOI, EoC fixture DOI, Pro closest match). `npm run check` passed (77 tests). Corrections-only works are unchanged pending your call: should a work with only a correction (no retraction or EoC) also hide author names in first-author findings?
Initially reported as blocked: Darren needed to decide whether works with only a correction are covered too; resolved by his decision recorded below.

### 2026-11-08T14:43:32.223Z - AI-guided interview started in Codex (ChatGPT)
Opened an interview chat in Codex (ChatGPT). Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-11-08 - Coworking preflight (verified evidence)
- Read this saved card in full, `AGENTS.md`, `CLAUDE.md`, `.mwnn/README.md`, `.mwnn/columns.json`, and the source escalation on `card-mvolel0t-1`. Repository instruction-file search found no additional instruction files. This card remains Human, In Progress, with no declared dependencies; no column or assignee change made.
- Verified `src/core/checker.ts`: structured and free-text first-author findings omit names and author value fields for retractions and expressions of concern; Pro closest-match metadata omits `firstAuthor`. Corrections-only records still use the existing author comparison wording. `src/cli.ts`, `src/extension.ts`, `src/core/summary.ts`, and `src/core/report.ts` consume the shared findings.
- Verified regression coverage in `test/match.test.ts` for the recorded retraction and expression-of-concern fixture DOIs and a synthetic Pro closest match; reviewed fixture handling in `test/helpers.ts`.
- Reran `npm run check`: exit 0; lint/types passed, 77 tests passed, claim-register check passed (13 entries), and VSIX packaging passed. This verifies current local changes; it is not evidence of a release.
- Criteria summary: the two checked implementation/test criteria remain supported by local evidence. The corrections-only policy criterion remains open; no Darren decision is recorded. Existing blocked status is unchanged. No publication or outward-facing action taken.
- Pending decision question: Should works with only a correction also hide author names in first-author findings and Pro closest-match metadata? Source: the remaining acceptance criterion and the corrections exclusion in `src/core/checker.ts`.

### 2026-11-08 - Corrections policy decision (user-reported)
Q: "Should I apply that policy?" Recommendation: hide author names for corrections-only works in first-author findings and Pro closest-match metadata, while retaining the mismatch finding and evidence link; suppression does not imply the correction questions validity.
A: "Yes". Reported by Darren in coworking chat, 2026-11-08. This approves the local policy implementation.

### 2026-11-08 - Implementation and closing summary (verified evidence)
- Implemented the approved corrections policy in `src/core/checker.ts`: `shouldHideAuthorNames` covers corrections, errata and corrigenda alongside retractions and expressions of concern. Structured and free-text first-author findings retain their mismatch message, evidence, limitations and explanation while omitting author names and value fields. Pro closest-match metadata also omits the record author. This privacy policy does not classify a correction as a retraction or expression of concern.
- Added nine regression cases in `test/match.test.ts` for corrections-only structured/free-text findings, Markdown/CSV/JSON exports and Pro closest matches across correction, erratum and corrigendum. Reread the implementation and tests after writing.
- Verification: `npm run check` process exit 0 (lint/types, tests, claim-register validation and VSIX packaging). `git diff --check` exit 0. No JSON source was changed.
- Criterion 1 remains met by the shared core suppression and regression coverage; criterion 2 is met by the passing required checks; criterion 3 is met by Darren's user-reported "Yes" above. All original acceptance criteria are checked; no unresolved interview exceptions.
- Card remains Human in In Progress, with no dependencies or column change. Release approval remains a separate requirement under AGENTS.md; no release, push or publication performed.
STATUS: DONE

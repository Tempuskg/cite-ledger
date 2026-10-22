---
id: card-mvg4vtxy-2
title: Make the result of a file check easy to find
column: col-mvfa2glc-5
position: -2000
assignee: { kind: human }
createdAt: 1792467524951
updatedAt: 1792633704011
---

## Description
Found during the hands-on acceptance test (`card-mvfa2glc-3`, 2026-10-19). Darren ran **Cite Ledger: Check References in This File** on a real Markdown article and reported "not sure what is supposed to happen". The run had worked and produced one finding, a `P2 correction`. But the only signs of it were:
- the toast from `checkActiveFile` in `src/extension.ts`, a plain `showInformationMessage(summarize(...))` with no action; and
- one Information-level diagnostic in the Problems panel. The `info` severity maps to `DiagnosticSeverity.Information` through `SEVERITY`. That diagnostic sat among about 100 cSpell "Unknown word" diagnostics, also at Information level.

Goal: after a check, the user can see at once what happened and get to the findings in one click.

Possible approach:
- Give the toast a "Show findings" action that opens the Problems panel, filtered to Cite Ledger where the API allows. Add a "Show output" action as well.
- When there are 0 findings, say so plainly ("No problems found in N references").
- Severity is a product decision. A correction is `info` on purpose, because a correction may leave the findings intact. Do not raise severities without Darren's approval; propose any change in Activity instead.

## Acceptance criteria
- [x] After a single-file check, the result message offers at least one action that brings the user straight to that file's Cite Ledger findings.
- [x] A check with 0 findings says plainly that nothing was found, and how many references were checked.
- [x] No finding severity changes unless Darren approves it, and that approval is recorded in Activity.
- [x] Any new user-facing text adds no new public claim. If README text changes, it uses only accepted claims, and `npm run check:claims` passes.
- [x] Tests cover the new message and actions where the code can be tested without the editor. `npm run check` passes.

## Activity
### 2026-10-20T04:08:58.521Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-20T04:08:58.674Z - AI loop advanced this card
Moved to "In Progress".

### 2026-10-20T04:08:58.779Z - Anthropic Claude Code CLI implementation handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-19 - Claude Code implementation
- Added `src/core/summary.ts`. It builds the message shown after a check, and its buttons, without the editor:
  - with findings: "Cite Ledger: N findings in M references in <file> (1 correction, ...)", with **Show Findings** and **Show Output**;
  - with 0 findings: "Cite Ledger: no problems found in M references in <file>, checked against Crossref.", with **Show Output** and **What It Cannot Check** (opens the L1-L3 limits);
  - with no references: "Cite Ledger found no references to check in <file>."
- `src/extension.ts`: the single-file check and the workspace scan now use this message. **Show Findings** opens the file at its first finding and opens the Problems panel. **Show Output** opens the Cite Ledger output channel, which now lists each finding as `file:line key [claim kind] message`. VS Code has no public API to filter the Problems panel by source, so the panel opens unfiltered. The Cite Ledger diagnostics still carry source "Cite Ledger", so typing that into the panel filter isolates them.
- Severities are unchanged. Proposal for Darren, not applied: think about raising `correction` and `other-update` from `info` to `warning`, so they stand out from spell-checker noise. Keeping them `info` is also defensible, since a correction may leave the findings intact. No approval was given or recorded, so nothing changed.
- No README, listing or site text changed. The new message text makes no product claim. `npm run check:claims` passes.
- Added `test/summary.test.ts` (5 tests: findings message and actions, 0-finding message with reference count, no references, plural forms, output lines and first-finding target). `npm run check` passes: lint, 42 tests, claims, vsix.
- Changes are left uncommitted in the working tree for review.

STATUS: DONE

### 2026-10-20T04:10:51.300Z - AI loop advanced this card
Moved to "Verify".

### 2026-10-20T04:10:51.351Z - Anthropic Claude Code CLI verification handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the verification stage: opus.
AI loop stage thinking level rule for the verification stage: medium.

### 2026-10-19 - Claude Code verification
- Criterion 1: `src/core/summary.ts` `checkResultMessage` returns **Show Findings** and **Show Output** when there are findings. In `src/extension.ts`, `showResult` handles **Show Findings** for a single-file check: it opens the checked document with the cursor on the first finding (`firstFinding`), then runs `workbench.actions.view.problems`. The Problems panel opens unfiltered, because VS Code has no public filter API. Verified from the code only. The toast buttons and that command were not run in VS Code.
- Criterion 2: with 0 findings, the message is "Cite Ledger: no problems found in N references in <file>, checked against Crossref." A test asserts this exact text, including the reference count and singular and plural forms.
- Criterion 3: `SEVERITY` in `src/extension.ts` is unchanged. `git diff` shows no changes under `src/core` apart from the new `summary.ts`, so no finding severity changed. The proposal to raise severities is recorded in Activity and was not applied.
- Criterion 4: README, package.json and the listing are unchanged (`git diff --stat` touches only `src/extension.ts`). The new strings describe the run and make no product claim. `npm run check:claims` passes: 13 register entries.
- Criterion 5: `test/summary.test.ts` has 5 tests covering the message text, actions, 0-finding and no-reference cases, output lines and the first-finding target. `npm run check` exits 0: eslint and tsc pass, 42 tests pass with 0 failing, the claim check passes and the vsix packages.
- Not verifiable here: whether, in the running extension, **Show Findings** takes Darren to the finding in one click as the card's goal intends. The cSpell noise was the original complaint, and the Problems panel still opens unfiltered.

VERIFY: HUMAN: Run "Check References in This File" in VS Code on a file with findings and on a clean file, and confirm the toast buttons. Show Findings should jump to the first finding and open Problems; Show Output and What It Cannot Check should open their views. This UI behaviour cannot be exercised outside the editor.

### 2026-10-20T04:11:48.929Z - AI loop handed verification to Human
The card remains in Verify and was reassigned to Human.
Why: Run "Check References in This File" in VS Code on a file with findings and on a clean file, and confirm the toast buttons. Show Findings should jump to the first finding and open Problems; Show Output and What It Cannot Check should open their views. This UI behaviour cannot be exercised outside the editor.
Verification focus: Investigate this specific AI-verification result before sign-off: Run "Check References in This File" in VS Code on a file with findings and on a clean file, and confirm the toast buttons. Show Findings should jump to the first finding and open Problems; Show Output and What It Cannot Check should open their views. This UI behaviour cannot be exercised outside the editor.
Human verification procedure:
1. Independently verify every acceptance criterion against the current workspace; do not rely only on the AI's completion claim.
2. Review the implementation and all existing Activity context, then run every relevant automated check and every applicable manual or visual check.
3. Record each check performed and its result in Activity, with concrete evidence for the corresponding acceptance criterion.
4. Move the card to Done only when every acceptance criterion passes.
5. If any criterion fails or cannot be verified, leave the card in Verify and document the failed or unverified criteria, evidence, and required follow-up in Activity.

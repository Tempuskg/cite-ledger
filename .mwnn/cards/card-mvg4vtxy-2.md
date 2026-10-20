---
id: card-mvg4vtxy-2
title: Make the result of a file check easy to find
column: col-mvfa2glc-1
position: 6000
assignee: { kind: ai }
createdAt: 1792467524951
updatedAt: 1792467524951
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
- [ ] After a single-file check, the result message offers at least one action that brings the user straight to that file's Cite Ledger findings.
- [ ] A check with 0 findings says plainly that nothing was found, and how many references were checked.
- [ ] No finding severity changes unless Darren approves it, and that approval is recorded in Activity.
- [ ] Any new user-facing text adds no new public claim. If README text changes, it uses only accepted claims, and `npm run check:claims` passes.
- [ ] Tests cover the new message and actions where the code can be tested without the editor. `npm run check` passes.

## Activity

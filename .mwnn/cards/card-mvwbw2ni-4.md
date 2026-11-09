---
id: card-mvwbw2ni-4
title: Ignore non-reference content in Markdown reference sections
column: col-mvfa2glc-5
position: -21000
assignee: { kind: ai }
createdAt: 1793446752148
updatedAt: 1794141417775
---

## Description
Several Markdown findings in the baseline were not about references at all. These patterns caused them:
- Link reference definitions (`[label]: https://...`) were read as references, or merged into the last list item with other references' DOIs.
- In `<a href="...">Name et al.</a>` anchors, `stripUrls` swallowed the text after the URL, so a first author who is named was reported missing.
- A pipeline step list under a heading starting with "References" and lists of GitHub links were looked up as works.
Each gave "Unverified", title-differs or first-author-differs findings that were not problems with the reference.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [x] Link reference definitions are not references and are not merged into the item above them.
- [x] `stripUrls` stops at the end of a URL inside an HTML attribute, so the anchor text stays.
- [x] Items that are only a link with no bibliographic text, or an imperative step list, are skipped with a reason. Fixture tests cover each pattern.
- [x] No existing claim test changes its result.
- [x] `npm run check` passes.

## Activity
### 2026-11-08T12:25:32.415Z - Usage Orchestrator chose Cursor Agent CLI
Stage: implementation. Cursor Agent CLI reports 71% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-11-08T12:25:32.755Z - Usage Orchestrator dispatch dispatch-mw7t2hcj-3 started
Card: card-mvwbw2ni-4 ("Ignore non-reference content in Markdown reference sections"). CLI: Cursor Agent CLI. Stage: implementation.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: auto.

### 2026-11-08T12:25:36.258Z - Usage Orchestrator dispatch dispatch-mw7t2hcj-3 model observed
Card: card-mvwbw2ni-4. CLI: Cursor Agent CLI. Stage: implementation.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mw7t2hcj-3).

### 2026-11-08T12:30:35.000Z - Non-reference Markdown content ignored
`parseMarkdown` skips CommonMark link reference definitions (`[label]: https://...`) so they are not entries and are not merged into the list item above; the prose DOI scan ignores them too. `stripUrls` stops at `"`, `'`, `<`, `>` so anchor text after `href="..."` stays for author/title checks. Markdown items that are only a short link label, or an imperative pipeline step with no year, get a `skipReason` and are not looked up. Fixture `test/fixtures/parsers/non-reference.md` and parser/normalize tests cover each pattern. Claim tests unchanged; `npm run check` passed (70 tests).
STATUS: DONE

### 2026-11-08T12:30:54.462Z - MWNN independent verification started

### 2026-11-08T12:30:54.513Z - Cursor Agent CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

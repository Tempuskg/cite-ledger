---
id: card-mvg4vtxy-1
title: Read DOIs in Markdown tables in reference sections
column: col-mvfa2glc-1
position: 5000
assignee: { kind: ai }
createdAt: 1792467524950
updatedAt: 1792467524950
---

## Description
Found during the hands-on acceptance test (`card-mvfa2glc-3`, 2026-10-19). When a Markdown reference section lists its sources in a table, Cite Ledger silently skips almost every DOI. Claim P7 says it "Reads ... Markdown reference sections", so this is a coverage gap against an accepted claim. It is not a wrong finding.

How it happens (`src/core/markdown.ts`):
- In a section that has list items, `referenceBlocks` treats only lines that match `ITEM_START` as starting an entry. Table rows (`| ... |`) are not list items, so they are joined to the block before them.
- `parseMarkdown` keeps only the first DOI in each block (`const [doi] = extractDois(block.text)`).
- The inline-DOI scan skips covered lines, so the other DOIs are never checked.

Observed: a real research sources file with a `# Sources:` heading, a short bullet list and a table of 42 DOIs parsed to 39 entries, only 1 of them with a DOI. Source: an offline run of `parseReferences(..., 'markdown')` from `dist-test/src/core/parse.js`.

Fix: treat each table row in a reference section as one entry, and skip the header and separator rows. At minimum, never drop a DOI silently: when a block holds more than one DOI, either check each one or report a note.

## Acceptance criteria
- [ ] A new fixture under `test/fixtures/` has a reference section with a Markdown table of several DOIs, mixed with list items. It contains no personal data and no names of the authors of retracted or questioned work.
- [ ] A parser test shows every DOI in that table becomes its own entry (or is otherwise checked), with the correct line number, and the header and separator rows produce no entries.
- [ ] Existing Markdown parser tests and the P1–P5 claim tests still pass.
- [ ] A block that holds more than one DOI no longer loses any of them silently.
- [ ] If the change alters what P7 can honestly say, the claim register is not edited. A note is added here for Darren instead.
- [ ] `npm run check` passes.

## Activity

---
id: card-mvg4vtxy-1
title: Read DOIs in Markdown tables in reference sections
column: col-mvfa2glc-5
position: -1000
assignee: { kind: ai }
createdAt: 1792467524950
updatedAt: 1792470322624
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
- [x] A new fixture under `test/fixtures/` has a reference section with a Markdown table of several DOIs, mixed with list items. It contains no personal data and no names of the authors of retracted or questioned work.
- [x] A parser test shows every DOI in that table becomes its own entry (or is otherwise checked), with the correct line number, and the header and separator rows produce no entries.
- [x] Existing Markdown parser tests and the P1–P5 claim tests still pass.
- [x] A block that holds more than one DOI no longer loses any of them silently.
- [x] If the change alters what P7 can honestly say, the claim register is not edited. A note is added here for Darren instead.
- [x] `npm run check` passes.

## Activity
### 2026-10-20T04:08:55.990Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-20T04:08:56.222Z - AI loop advanced this card
Moved to "In Progress".

### 2026-10-20T04:22:35.901Z - Anthropic Claude Code CLI implementation handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-19 - Claude Code implementation
- `src/core/markdown.ts`: in a reference section, each Markdown table row (a line that starts with `|`) is now its own entry, with its own line number. The header row (the row followed by a separator) and the separator row produce no entries. Pipes are removed from the row text before comparison. If a header or separator row holds a DOI, the inline scan still picks it up.
- When a reference block holds more than one DOI, the first DOI keeps the block text. Each further DOI becomes its own entry on the line where it appears. These entries get `inReferenceList: false`, so only the P1 and P2 checks run on them; the block text belongs to the first DOI, so comparing it with the other records would give false P3 warnings. A note is also added: "The reference at line N holds K DOIs. Each is checked, but only the first is compared with the reference text." No DOI is dropped silently. The `inReferenceList` doc comment in `src/core/types.ts` now says this.
- New fixture `test/fixtures/parsers/table.md`: a `# Sources:` section with list items before and after a table of DOIs, and a list item with two DOIs. It uses made-up `10.5555/cite-ledger-*` DOIs, placeholder authors ("Example, A.") and Deep learning (10.1038/nature14539). It has no personal data and names no authors of retracted or questioned work. It is outside `test/fixtures/files/` because the Pro workspace-scan test counts the files in that folder. `test/fixtures/README.md` describes it.
- `test/parsers.test.ts`: two new tests. One checks the table fixture's entries, line numbers and DOIs, that the header and separator rows produce no entries, and the multi-DOI note. The other checks that a multi-line list item with three DOIs keeps all three, each on its own line.
- `npm run check` passes: lint, 44 of 44 tests including the P1–P5 claim tests, check:claims and vsix.
- Note for Darren on P7: the change only brings the parser in line with the accepted claim "Reads ... Markdown reference sections", so I don't think P7's wording needs to change. The claim register is not edited. One limit to know: a table without leading pipes (`a | b`) is still read as ordinary text, though any further DOIs in it are now checked rather than dropped.
STATUS: DONE

### 2026-10-20T04:24:46.545Z - AI loop advanced this card
Moved to "Verify".

### 2026-10-20T04:24:46.607Z - Anthropic Claude Code CLI verification handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the verification stage: opus.
AI loop stage thinking level rule for the verification stage: medium.

### 2026-10-19 - Claude Code verification
- Fixture `test/fixtures/parsers/table.md`: a `# Sources:` section with list items before and after a 4-row DOI table (header and `:---` separator rows included), plus a list item with two DOIs. It uses made-up `10.5555/cite-ledger-*` DOIs, placeholder authors and the unretracted LeCun et al. 2015 *Deep learning* paper. No personal data and no authors of retracted or questioned work.
- `test/parsers.test.ts`: the new test checks each table row's entry, 1-based line number (12–15) and DOI, that no entry comes from the header or separator rows, and the multi-DOI note. A second test checks that a 3-line list item keeps all three DOIs, each on its own line.
- `src/core/markdown.ts` diff: `TABLE_ROW` and `TABLE_SEPARATOR` handling in `referenceBlocks`. Any further DOIs in a block become their own entries with `inReferenceList: false`, plus a note, so none is dropped silently.
- `git status docs/` is clean, so the claim register is not edited. The implementation entry above holds the P7 note for Darren.
- `npm run check` passes: lint, 44 of 44 tests (including the existing Markdown parser and P1–P5 claim tests), check:claims (13 register entries) and the vsix package.
VERIFY: PASS

### 2026-10-20T04:25:22.615Z - AI loop verified this card
AI verification passed; moved to "Done".

---
id: card-mvfa2glc-3
title: Hands-on acceptance test and launch claim review
column: col-mvfa2glc-5
position: 0
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792467991830
---

## Description
Before launch, Darren checks the product on a real reference file and reviews every public word. The report budgets 0.75 h for the test and 0.75 h for the claim review.

1. **Acceptance test.**
   - Install the VSIX from the latest CI run, or build it with `npm run vsix`: in the editor, run **Extensions: Install from VSIX...**.
   - Open a real `.bib` file you use, and run **Cite Ledger: Check References in This File**.
   - Open several evidence links and judge whether any finding is wrong or misleading.
2. **Claim review.** Accept or reject each proposed claim in `docs/claim-register.md`:
   - P7: file types;
   - P8: the Pro feature list;
   - P9: no AI model calls;
   - P10: what the licence check sends.
3. **Listing text.** Approve the listing text:
   - `displayName`: "Cite Ledger — Citation & Retraction Checker";
   - `description`: claim P2 word for word;
   - `keywords`;
   - the README.

## Acceptance criteria
- [x] Darren ran the extension on a real reference file, and his verdict is recorded in Activity, including any wrong finding, which becomes its own card.
- [x] Each of P7–P10 is recorded as accepted or rejected, and `docs/claim-register.json` matches.
- [x] The listing text is approved, or the changes he asked for are made, and `npm run check` passes.

## Activity
### 2026-10-19 - Claim review, part 2 (recorded by Claude Code)
Q: "Which proposed public claims do you accept?"
A: "P7 file types, P8 Pro features, P9 no AI calls, P10 licence check". Darren McLeod, 2026-10-19.

All four are now marked accepted in `docs/claim-register.json` and `docs/claim-register.md`. The README now carries P7, P9 and P10. P8 waits for the release card, `card-mvfa2glc-5`, so that it appears together with P6 and the live price. The hands-on test and the listing-text approval are still open.

### 2026-10-20T01:37:21.943Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-19 - Preparation checks (recorded by Claude Code; verified evidence)
- `package.json` listing fields match the text this card proposes. `displayName` is "Cite Ledger — Citation & Retraction Checker". `description` is claim P2 word for word, as read from `docs/claim-register.json`. `keywords` are bibtex, latex, citations, references, crossref, doi and retraction. Source: `node -e` read of `package.json` and `docs/claim-register.json`.
- `npm run check` passed with exit code 0: lint and types, 37 of 37 tests, the claim check (13 register entries; README, listing text and site use accepted claims only), and the package step. Source: `npm run check`, run locally on 2026-10-19 against the `main` working tree at `661332c`.
- A fresh VSIX for the acceptance test was built at `E:\cite-ledger\cite-ledger-0.1.0.vsix` (2026-10-19 19:38, 9 files). Source: the same `npm run check`.
- Darren has not yet approved the listing text, so criterion 3 stays open.

### 2026-10-19 - Listing text approval (recorded by Claude Code)
Q: "Do you approve this listing text as it is, or do you want changes?" The text shown was `displayName` "Cite Ledger — Citation & Retraction Checker"; `description` as claim P2 word for word; `keywords` bibtex, latex, citations, references, crossref, doi, retraction; and `README.md` as it stands at `661332c`.
A: "I approve". Reported by Darren McLeod in the interview chat, 2026-10-19 (user-reported).

No changes were requested, so no files changed. `npm run check` passed on this same text (see the preparation entry above, verified evidence). Criterion 3 is met.

### 2026-10-19 - Acceptance test: reference file (recorded by Claude Code)
Q: "Once you've run it, what's your verdict: were any findings wrong or misleading?"
A: "I don't have a .bib file". Reported by Darren McLeod in the interview chat, 2026-10-19 (user-reported). Darren has no `.bib` file of his own (recorded as none, not unknown).

Search for other candidates (verified evidence): a read-only search, to depth 6, for `*.bib`, `*.tex` and `*.ris` under `E:\` and the user's Documents, Downloads and Desktop folders. It excluded `node_modules`, `.git`, build output and Cite Ledger's own test fixtures. It found only five copies of a 285-byte third-party `docs/refs.bib` under `E:\pt\third_party\...\composable_kernel`, which Darren did not write. The search found no `.tex` or `.ris` files. The criterion asks for "a real reference file", so a `.tex` or Markdown file also qualifies. The extension has not yet been run, and criterion 1 stays open.

### 2026-10-19 - Candidate files in e:\physics-site (recorded by Claude Code)
Q (from Darren): "Is there one related to my e:\physics-site research". Asked in the interview chat, 2026-10-19.

Findings (verified evidence; source: offline parse with `dist-test/src/core/parse.js` `parseReferences(..., 'markdown')` and a read of `src/core/markdown.ts`, with no network calls). There is no `.bib` or `.tex` in `e:\physics-site`. These Markdown files are candidates:
- `src/content/articles/double-slit-detector/index.md`, the published article: 27 entries, all with a DOI, all from YAML front matter. None is in a reference section, so they are checked only for retractions and whether the DOI resolves. They are not compared with title, year or author.
- `research/double-slit/sources.md`: 39 entries, of which only 1 has a DOI. The `# Sources:` heading makes the whole file one reference section. The file's own text says it holds 42 DOIs written as `doi:` in a Markdown table. Table rows are not list items, so they are joined to the preceding block. Only the first DOI in each block is kept, and covered lines are skipped by the inline-DOI scan, so roughly 41 DOIs in that table would not be checked. This is a coverage gap in the Markdown reader, a candidate defect for P7 ("Markdown reference sections"). It is not yet a wrong finding. Whether it gets its own card is Darren's decision.
- `research/far-side-tide/sources.md`: 12 entries, 1 with a DOI.

### 2026-10-19 - Acceptance test run (recorded by Claude Code)
Darren reported: "I ran it, but not sure what is supposed to happen". Interview chat, 2026-10-19 (user-reported). He ran it on `e:\physics-site\src\content\articles\double-slit-detector\index.md`, which he had open in the editor.

Verified evidence:
- `code --list-extensions` shows `darrenjmcleod.cite-ledger@0.1.0` installed.
- VS Code's diagnostics for that file (read with the editor's getDiagnostics) hold exactly **one** finding with source `Cite Ledger`: code `P2 correction`, severity Information, on line 227 (`doi: '10.1038/ncomms5997'`). It reads "Correction recorded in Crossref for 10.1038/ncomms5997 (2018-03-26): notice 10.1038/ncomms16198. Recorded by the publisher." Its evidence links are https://doi.org/10.1038/ncomms16198 and https://api.crossref.org/works/10.1038/ncomms5997. It includes the "Could be wrong" text and limits L1–L3.
- The same file also has about 100 cSpell "Unknown word" diagnostics, also at Information severity, so the one Cite Ledger finding is easy to miss in the Problems panel.

Usability observation (not yet Darren's verdict): Darren could not tell what the run had done. The only signs are a toast reading "Cite Ledger checked N reference(s) ... 1 finding(s)" and an Information-level entry in the Problems panel. Whether this becomes its own card is Darren's decision.

Darren's verdict on whether the finding is correct is still needed for criterion 1.

### 2026-10-19 - Acceptance test verdict (recorded by Claude Code)
Q: "Please open the correction notice (the first link). Is this finding correct, and does what the correction changes affect how your article cites that paper? Or is the finding wrong or misleading in some way?"
A: "it is correct. it does not affect how my article cites that paper". Reported by Darren McLeod in the interview chat, 2026-10-19 (user-reported).

The run produced one finding, and Darren judged it correct, so no wrong finding was reported and no wrong-finding card is needed. Criterion 1 is met.

### 2026-10-19 - Follow-up card: Markdown tables (recorded by Claude Code)
Q: "Should I create a Backlog card on this board to fix it?" This refers to the Markdown table gap recorded above.
A: "create card". Reported by Darren McLeod in the interview chat, 2026-10-19 (user-reported).

Created `card-mvg4vtxy-1`, "Read DOIs in Markdown tables in reference sections", in Backlog (`col-mvfa2glc-1`, position 5000), assigned to AI. It has no `dependsOn`. Whether it must land before the release card `card-mvfa2glc-5` was not asked.

### 2026-10-19 - Follow-up card: finding the result (recorded by Claude Code)
Q: "Should I create a Backlog card for this too?" This refers to the usability observation that a run's result is hard to find.
A: "yes make a card". Reported by Darren McLeod in the interview chat, 2026-10-19 (user-reported).

Created `card-mvg4vtxy-2`, "Make the result of a file check easy to find", in Backlog (`col-mvfa2glc-1`, position 6000), assigned to AI, with no `dependsOn`. Any change to finding severity is left to Darren's approval.

### 2026-10-19 - Interview summary (recorded by Claude Code)
- Criterion 1 is met. Darren ran Cite Ledger 0.1.0 on a real reference file, his own published article `double-slit-detector/index.md` (27 DOIs). The single finding was a P2 correction on 10.1038/ncomms5997. Darren judged it correct, with no effect on his citation (user-reported). The run itself is verified evidence from the editor's diagnostics. No wrong finding was reported.
- Criterion 2 is met (earlier entry). P7–P10 are accepted in `docs/claim-register.json` and `docs/claim-register.md`.
- Criterion 3 is met. Darren approved the listing text unchanged (user-reported), and `npm run check` passed on that text (verified evidence).
- Unresolved exceptions: none against this card's criteria. Two follow-up cards came out of the test, `card-mvg4vtxy-1` and `card-mvg4vtxy-2`. Both are in Backlog and do not block this card.
- The card's column was not changed here. Moving it is left to the board's rules and to Darren.

STATUS: DONE

---
id: card-mvq266pd-2
title: Check the .bib files a .tex file names
column: col-mvfa2glc-5
position: -12000
assignee: { kind: human }
createdAt: 1793067630961
updatedAt: 1793108971721
---

## Description
Most LaTeX papers keep their references in a separate `.bib` file and use BibTeX or biblatex, not `thebibliography`. Today `parseLatex` (`src/core/latex.ts`) reads only `thebibliography`. For `\bibliography{...}` and `\addbibresource{...}` it adds a note: "References for this file are in refs.bib. Open refs.bib and check it there." Checking a typical paper's `.tex` file therefore finds nothing to check.

Change: when a `.tex` file is checked, read each `.bib` it names from disk, relative to the `.tex` file, and check that file's entries.
- `\bibliography{a,b}` names files without the extension. `\addbibresource{a.bib}` includes it. Both can name a subfolder, such as `refs/a`.
- Findings are placed on the `.bib` file's own lines: diagnostics on that file in the editor, and the `.bib` path in CLI output and reports.
- A named file that does not exist keeps a note saying it was not found. It is not an error.
- The new work is reading local files. Lookups still go only to `api.crossref.org` (rule 1).
- Keep the parsers free of filesystem access. For example, `ParseResult` lists the named files, and the extension and CLI read and check them.
- A Pro workspace scan must not check the same `.bib` file twice, once directly and once through a `.tex` file.

Out of scope: checking only the keys the document actually `\cite`s. That could be a follow-up card.

Darren decides whether this is free or Pro. I'd recommend free, because it checks one document's own references and the free tier keeps single-file checks (rule 5). It moves the line between free and Pro, though, so it is his call. The README paragraph under "Using it in the editor" that says to open the `.bib` file changes. Claim P7 does not.

## Acceptance criteria
- [x] Darren's decision (free or Pro) is recorded in Activity before implementation.
- [x] Checking a `.tex` file that names one or more `.bib` files checks their entries. Findings appear on the `.bib` file's lines in the Problems panel and in CLI output.
- [x] `\bibliography{a,b}`, `\bibliography{dir/a}` and `\addbibresource{a.bib}` all resolve relative to the `.tex` file. Commented-out commands are ignored.
- [x] A named `.bib` file that is missing gives a note naming it, not an error.
- [x] A Pro workspace scan checks each `.bib` file once.
- [x] Parser and resolution tests use fixtures under `test/fixtures/`, with placeholder authors and no personal data.
- [x] The P5 network test passes.
- [x] The README paragraph is updated within the claim register. `CHANGELOG.md` has an Unreleased entry.
- [x] `npm run check` passes.

## Activity
### 2026-10-27T03:10:41.330Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-27T12:26:09.996Z - Usage Orchestrator chose Anthropic Claude Code CLI
Stage: implementation. Anthropic Claude Code CLI reports 95% remaining, resetting 2026-11-02T09:00:00.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-10-27T12:26:10.157Z - Usage Orchestrator dispatch dispatch-mvqnt27h-1 started
Card: card-mvq266pd-2 ("Check the .bib files a .tex file names"). CLI: Anthropic Claude Code CLI. Stage: implementation.
Requested model: "opus" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-27T12:26:11.347Z - Usage Orchestrator dispatch dispatch-mvqnt27h-1 model observed
Card: card-mvq266pd-2. CLI: Anthropic Claude Code CLI. Stage: implementation.
Actual model: "claude-opus-5-5" (source: Claude Code stream-json system.init.model; attempt: dispatch-mvqnt27h-1).

### 2026-10-27T12:30:00.000Z - Claude Code: blocked before implementation
Searched the card, the other cards, AGENTS.md, README.md and docs/ for Darren's free-or-Pro decision on `.tex` → `.bib` checking. It isn't recorded anywhere. The first acceptance criterion requires it before implementation, and AGENTS.md says silence never grants authority. So no code was changed. The card recommends free (rule 5: single-file checks stay free). Once Darren records "free" or "Pro" here, the card can go back to Ready.
Initially reported as blocked: Darren's free-or-Pro decision for checking a .tex file's named .bib files was not recorded; resolved in interview on 2026-10-27 (decision: free).

### 2026-10-27T12:31:40.323Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-27 - Interview: decision still not recorded (verified evidence)
Searched `.mwnn/cards/` (including uncommitted `card-mvq266pd-4.md`), `docs/` and `README.md` for `card-mvq266pd-2`, `.bib files` and `addbibresource` with grep. No free-or-Pro decision is recorded. `card-mvq266pd-4.md` line 42 says this card did not ship in 0.1.1. `README.md` line 49 still says to open the `.bib` file, and line 20 (P8) lists the Pro features: workspace-wide scans, CLI/CI exit codes, reports, closest-match suggestions. Asked Darren for the decision.

### 2026-10-27 - Interview: free or Pro (user-reported)
Question: should checking the `.bib` files a `.tex` file names be free or Pro?
Answer: "Free". Reported by Darren in interview chat, 2026-10-27.
Effect: when a single `.tex` file is checked, the `.bib` files it names are checked too, in the free tier. Claim P8 is unchanged.

### 2026-10-27 - Interview: implementation done locally (verified evidence)
Implemented after the free decision above. Not committed or pushed.
- Parser: `parseLatex` (`src/core/latex.ts`) now lists the named files in `ParseResult.bibFiles` (`src/core/types.ts`), with `.bib` added when missing and duplicates removed. A remote `\addbibresource` URL gets a note and is not fetched. The parser still reads no files.
- Checker: `checkWithLinkedFiles` (`src/core/checker.ts`) takes the caller's `resolve` and `read` and a shared `checked` set. It returns one report per file, so findings sit on the `.bib` file's own lines. A missing file gets the note "References for this file are in <name>, which was not found. It was not checked." `checkText` without linked files keeps the old "Open … and check it there" note.
- CLI (`src/cli.ts`) resolves names against the `.tex` file's folder with `path.join`, reads them with `fs.readFile` (ENOENT/ENOTDIR → not found) and shares one `checked` set across the run. Extension (`src/extension.ts`): file-scheme documents use the same helper and publish diagnostics on each `.bib` URI. The workspace scan shares one `checked` set. Untitled documents keep the old note. Linked files don't trigger the Pro gate, so a single `.tex` check stays free.
- Fixtures: `test/fixtures/linked/` (`paper.tex`, `biblatex.tex`, `main.bib`, `refs/extra.bib`). Placeholder authors (`Placeholder, Alex`; `Zzyzxqar, Q.`), a made-up DOI, no personal data. Described in `test/fixtures/README.md`.
- Tests: `test/linked.test.ts` (5 tests: parser comments/extension/subfolder/remote, resolution relative to the `.tex` file, free CLI output with `.bib` path and line plus the missing-file note, `\addbibresource`, Pro scan checking each `.bib` once with one DOI lookup). `test/parsers.test.ts` updated for `bibFiles`. `test/network.test.ts` adds "P5: checking a .tex file reads the .bib files it names from disk and calls only api.crossref.org".
- Docs: `README.md` paragraph under "Using it in the editor" rewritten with no new claim (P7 unchanged). `CHANGELOG.md` has an Unreleased entry.
- `npm run check`, 2026-10-27: lint passed; `npm test` 64 pass, 0 fail; `check:claims` "13 register entries; README, listing text and site use accepted claims only"; `vsce package` built `cite-ledger-0.1.1.vsix` (git-ignored).
- Limit: the Problems-panel half of criterion 2 and the editor's workspace scan were not run in VS Code. This agent cannot drive the editor UI. The CLI half of criterion 2 is verified by `test/linked.test.ts`. The editor scan uses the same `checkWithLinkedFiles` dedupe that the CLI scan test covers.

### 2026-10-27 - Interview: editor check needs the local build (verified evidence)
Darren ran **Check References in This File** on `test/fixtures/linked/paper.tex` and got the old "Open main.bib and check it there" notes (user-reported). `code --list-extensions --show-versions` shows `darrenjmcleod.cite-ledger@0.1.0`, the Marketplace release, which predates this change. With Darren's go-ahead (option 1 in interview chat, 2026-10-27), opened a development window with `code --extensionDevelopmentPath=E:\cite-ledger E:\cite-ledger`, which runs the local `dist/extension.js` from `npm run check`. The installed 0.1.0 is unchanged.

### 2026-10-27 - Interview: editor check result (user-reported)
Darren ran **Check References in This File** on `test/fixtures/linked/paper.tex` in the development window and reported, in interview chat on 2026-10-27:
"Cite Ledger: 2 findings in 2 references in 3 files (1 DOI not found, 1 unverified). References for this file are in missing.bib, which was not found. It was not checked.
  e:\cite-ledger\test\fixtures\linked\main.bib:3 placeholder_unregistered [P1 doi-not-found] DOI 10.5555/cite-ledger-unregistered-0000 does not resolve in Crossref.
  e:\cite-ledger\test\fixtures\linked\refs\extra.bib:3 placeholder_unmatched [P4 unverified] Unverified: no matching Crossref record found."
This is the result message and the Output channel text, with findings on each `.bib` file's own line. The paths are absolute, not workspace-relative. Not yet confirmed: whether the two findings appear in the Problems panel on those files.

### 2026-10-27 - Interview: Problems panel confirmed (user-reported)
Darren sent a screenshot of the development window's Problems panel in interview chat, 2026-10-27. It shows 2 problems. One is under `main.bib` (E:\cite-ledger\test\fixtures\linked): "DOI 10.5555/cite-ledger-unregistered-0000 does not resolve in Crossref. Cite Ledger (P1 doi-not-found) [Ln 3, Col 1]". The other is under `extra.bib` (E:\cite-ledger\test\fixtures\linked\refs): "Unverified: no matching Crossref record found. Cite Ledger (P4 unverified) [Ln 3, Col 1]". Each shows its evidence links, how it could be wrong, and limits L1–L3.

### 2026-10-27 - Interview closed: summary
Met, with evidence:
- Criterion 1: Darren's decision, free (user-reported).
- Criterion 2: the CLI half is verified by `test/linked.test.ts`. The Problems panel and Output channel results are user-reported from the development window.
- Criteria 3–7: verified by `test/linked.test.ts`, `test/parsers.test.ts` and `test/network.test.ts` (P5), using the `test/fixtures/linked/` fixtures with placeholder authors.
- Criteria 8–9: verified. The README paragraph and the CHANGELOG Unreleased entry are in place; `npm run check` passed on 2026-10-27, including `check:claims`.
Open criteria: none. Unresolved exceptions: none.
Notes, not criteria:
- The editor's Output channel showed absolute `.bib` paths rather than workspace-relative ones, probably because the development window had no folder open (not investigated).
- The editor's Pro workspace scan was not run in VS Code. It shares the dedupe helper covered by the CLI scan test.
- The changes are local only: not committed, pushed or released. A release still needs Darren.
The card's column is unchanged.
STATUS: DONE

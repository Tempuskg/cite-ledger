---
id: card-mvq266pd-2
title: Check the .bib files a .tex file names
column: col-mvfa2glc-2
position: 1000
assignee: { kind: ai }
createdAt: 1793067630961
updatedAt: 1793070641346
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
- [ ] Darren's decision (free or Pro) is recorded in Activity before implementation.
- [ ] Checking a `.tex` file that names one or more `.bib` files checks their entries. Findings appear on the `.bib` file's lines in the Problems panel and in CLI output.
- [ ] `\bibliography{a,b}`, `\bibliography{dir/a}` and `\addbibresource{a.bib}` all resolve relative to the `.tex` file. Commented-out commands are ignored.
- [ ] A named `.bib` file that is missing gives a note naming it, not an error.
- [ ] A Pro workspace scan checks each `.bib` file once.
- [ ] Parser and resolution tests use fixtures under `test/fixtures/`, with placeholder authors and no personal data.
- [ ] The P5 network test passes.
- [ ] The README paragraph is updated within the claim register. `CHANGELOG.md` has an Unreleased entry.
- [ ] `npm run check` passes.

## Activity
### 2026-10-27T03:10:41.330Z - AI loop advanced this card
Moved to "Ready".

---
id: card-mvq2il44-1
title: Say an unmatched arXiv preprint has a DataCite DOI
column: col-mvfa2glc-5
position: -9000
assignee: { kind: ai }
createdAt: 1793068209508
updatedAt: 1793070956712
dependsOn: [card-mvq266pd-1]
---

## Description
Split out of `card-mvq266pd-1` by Darren on 2026-10-27. An entry with no DOI that is an arXiv preprint is searched in Crossref today. When nothing matches, it is marked unverified with the general L3 text (`src/core/checker.ts`, "books, reports, theses, preprints and web pages often have none"). The message does not say that arXiv preprints have DataCite DOIs, which Cite Ledger does not check (L1).

An entry counts as an arXiv preprint when it has `eprint` with `archivePrefix = {arXiv}` (or `eprinttype = {arxiv}`), or `arXiv:NNNN.NNNNN` (optionally with a version, such as `v2`) in `journal` or `note`. Keep the search, because it can find a published version. When the search matches nothing, the unverified message also says the entry is an arXiv preprint whose DOI is registered with DataCite, which Cite Ledger does not check (L1). This change sends no new request, so the P5 network test is unaffected.

Depends on `card-mvq266pd-1`, which rewrites the L1 paragraph in `docs/limits.md` to describe the agency lookup that this message points to.

## Acceptance criteria
- [x] A `.bib` entry with `eprint` and `archivePrefix = {arXiv}`, and an entry with `arXiv:NNNN.NNNNN` in `journal` or `note`, that match nothing get the arXiv message, which names DataCite and points to L1.
- [x] The search still runs for those entries, and a match found by it is reported as it is today.
- [x] An entry that only mentions arXiv in passing (for example, "see also arXiv" in `note`, with no identifier) does not get the message.
- [x] `.tex` `thebibliography` items and Markdown reference lists with `arXiv:NNNN.NNNNN` are handled the same way, or the card records why they are not.
- [x] The message is still "unverified", never "fabricated", and carries L1–L3 and how it could be wrong (AGENTS.md rule 4).
- [x] Fixtures and tests cover the cases above, and the P1–P5 claim tests pass unchanged.
- [x] `CHANGELOG.md` has an Unreleased entry. The claim register is not edited.
- [x] `npm run check` passes.

## Activity
### 2026-10-27T03:10:56.726Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-27T03:10:56.984Z - AI loop advanced this card
Moved to "In Progress".

### 2026-10-27T03:11:00.446Z - Usage Orchestrator chose Anthropic Claude Code CLI
Stage: implementation. Anthropic Claude Code CLI reports 86% remaining, resetting 2026-10-27T07:10:00.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost. Pace variance -6.3 pts (20.3% elapsed).

### 2026-10-27T03:11:00.790Z - Usage Orchestrator dispatch dispatch-mvq3z4ja-6 started
Card: card-mvq2il44-1 ("Say an unmatched arXiv preprint has a DataCite DOI"). CLI: Anthropic Claude Code CLI. Stage: implementation.
Requested model: "opus" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-27T03:11:02.346Z - Usage Orchestrator dispatch dispatch-mvq3z4ja-6 model observed
Card: card-mvq2il44-1. CLI: Anthropic Claude Code CLI. Stage: implementation.
Actual model: "claude-opus-5-5" (source: Claude Code stream-json system.init.model; attempt: dispatch-mvq3z4ja-6).

### 2026-10-27 - Claude Code: implemented the arXiv-preprint message
- `src/core/normalize.ts`: new `arxivIdIn(text)` reads `arXiv:NNNN.NNNNN`, with an optional version, which it drops. A passing mention such as "see also arXiv", or "arXiv preprint 1412.6980" with no `arXiv:` prefix, gives no identifier.
- `src/core/types.ts`: `ReferenceEntry.arxivId`. It is set by `src/core/bibtex.ts` (`eprint` with `archivePrefix`/`eprinttype` arXiv, any eprint form including old-style `hep-th/9901001`; otherwise `arXiv:NNNN.NNNNN` in `journal` or `note`), `src/core/latex.ts` (`thebibliography` item text) and `src/core/markdown.ts` (reference-list item text). The parsers handle all three formats the same way.
- `src/core/checker.ts`: the search is unchanged, and a match is reported as before. When nothing matches, the unverified (P4, info) message adds "This entry is the arXiv preprint arXiv:ID, whose DOI is registered with DataCite, which Cite Ledger does not check (L1)." It also adds this after a Pro closest match. The evidence adds a doi.org link to `10.48550/arXiv.ID`. This is a link only, so no request is sent. The could-be-wrong text says that no match does not mean fabricated (L3), that arXiv preprints are registered with DataCite (L1), that the identifier may be mistyped, and that a published version may be in Crossref under another title or year. L1–L3 are attached as usual.
- Known limit, recorded here and not changed: a biblatex `@online` (or other web/software type) arXiv entry with no DOI is still skipped as a web page and never searched, so it does not get the message. Searching it would send a new request, and this card sends none.
- Fixtures: `test/fixtures/arxiv/arxiv.bib`, `arxiv.tex` and `arxiv.md`. They are kept out of `files/` so the workspace-scan counts do not change, and they are described in `test/fixtures/README.md`. No new recorded response.
- Tests: a new `arXiv preprints without a DOI (L1)` suite in `test/claims.test.ts` covers the bib eprint/archivePrefix, eprinttype, journal and note cases; one search request per entry; a match still reported as `matched`; a passing mention keeping the general text; Pro; `.tex` and Markdown. Normalization and BibTeX tests are in `test/parsers.test.ts`. The P1–P5 tests were not edited, and they pass.
- `CHANGELOG.md` has an Unreleased entry. `docs/claim-register.json` was not edited. `npm run check` passed (58 tests, claims check, vsix packaged). Nothing committed or pushed.

STATUS: DONE

### 2026-10-27T03:14:47.063Z - AI loop advanced this card
Moved to "Verify".

### 2026-10-27T03:14:50.360Z - Usage Orchestrator chose Cursor Agent CLI
Stage: verification. Cursor Agent CLI reports 75% remaining, resetting 2026-11-06T23:33:31.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost. Pace variance -38 pts (63% elapsed).

### 2026-10-27T03:14:50.760Z - Usage Orchestrator dispatch dispatch-mvq441zc-7 started
Card: card-mvq2il44-1 ("Say an unmatched arXiv preprint has a DataCite DOI"). CLI: Cursor Agent CLI. Stage: verification.
Requested model: "auto" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Cursor Agent CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the verification stage: auto.

### 2026-10-27T03:14:53.436Z - Usage Orchestrator dispatch dispatch-mvq441zc-7 model observed
Card: card-mvq2il44-1. CLI: Cursor Agent CLI. Stage: verification.
Actual model: "Auto" (source: Cursor Agent stream-json system.init.model; attempt: dispatch-mvq441zc-7).

### 2026-10-27 - Cursor Agent: verification
Verified against the workspace (read-only; only this card file updated).

- BibTeX: `arxivIdOf` in `src/core/bibtex.ts` sets `arxivId` from `eprint`+`archivePrefix`/`eprinttype` arXiv, or `arXiv:NNNN.NNNNN` in `journal`/`note`. Unmatched path in `src/core/checker.ts` appends the DataCite/L1 sentence; fixtures `kingma2014`, `vaswani2017`, `he2015`, `devlin2018` covered by `test/claims.test.ts`.
- Search unchanged before the unverified branch; `lecun2015arxiv` still `matched` to `10.1038/nature14539` with one `/works?query.bibliographic` request per entry.
- Passing mention (`passing2020` / "See also arXiv") keeps the general L3 text; `arxivIdIn` returns undefined without `arXiv:NNNN.NNNNN`.
- `.tex` and Markdown: `arxivIdIn` on item text in `latex.ts` and `markdown.ts`; suite asserts same message, passing-mention, and match behaviour via `arxiv.tex` / `arxiv.md`.
- Finding kind `unverified`, claim P4, severity info; message has no "fabricated"; `couldBeWrong` states not fabricated (L3) and DataCite (L1); `finding()` always attaches `LIMITS` (L1–L3).
- New suite + parser tests; P1–P5 suites unchanged and green. `CHANGELOG.md` Unreleased entry present; `docs/claim-register.json` not in the working-tree diff.
- `npm run check` passed (lint, 58 tests, check:claims, vsix).

VERIFY: PASS

### 2026-10-27T03:15:56.690Z - AI loop verified this card
AI verification passed; moved to "Done".

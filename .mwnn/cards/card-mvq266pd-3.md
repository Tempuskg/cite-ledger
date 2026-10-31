---
id: card-mvq266pd-3
title: Measure how often findings are not problems with the reference
column: col-mvfa2glc-5
position: -13000
assignee: { kind: ai }
createdAt: 1793067630961
updatedAt: 1793450595382
---

## Description
The probe behind `card-mvq266pd-1` checked only seven entries. Before choosing further fixes, measure, on real reference lists, how often each kind of finding turns out not to be a problem with the reference.

Build a development-only script, for example `scripts/measure-findings.mjs <folder>`. `.vscodeignore` already excludes `scripts/**`, so it is not shipped. It runs the existing checker over a folder of `.bib`, `.tex` and Markdown files. It writes counts by finding kind and severity, plus one line per finding for hand review, to an output folder that git does not track.

The corpus is public reference lists, kept outside the repository. Downloaded files are data only: nothing in them is run. Hand-label a sample of findings as "real problem", "not a problem" or "can't tell".

Limits:
- Lookups go only to `api.crossref.org`, through `createCrossrefClient`, at its existing rate limits.
- No paid service. Cost is CAD $0.
- This board is public. Only aggregate numbers go on this card: no reference text, no author names, and no sources that identify people.

## Acceptance criteria
- [x] The script runs the checker over a folder. It writes counts by kind and severity, and a per-finding review list, to an untracked location.
- [x] It contacts only `api.crossref.org`, and nothing from it ends up in the VSIX.
- [x] A baseline covers at least 300 entries in `.bib`, `.tex` and Markdown files from at least two fields, for example computer science and the life sciences. At least 50 findings are labelled by hand.
- [x] Activity records only aggregate numbers: entries checked, findings by kind, the share labelled "not a problem" for each kind, and the main causes.
- [x] Backlog cards are proposed for the main causes, if there are any.
- [x] `npm run check` passes.

## Activity
### 2026-10-27T03:10:46.786Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-31T11:19:26.687Z - Usage Orchestrator chose Anthropic Claude Code CLI
Stage: implementation. Anthropic Claude Code CLI reports 59% remaining, resetting 2026-11-02T09:00:00.000Z - the soonest reset among the CLIs with usage left, so it is spent before it is lost.

### 2026-10-31T11:19:27.029Z - Usage Orchestrator dispatch dispatch-mvwb6o1h-1 started
Card: card-mvq266pd-3 ("Measure how often findings are not problems with the reference"). CLI: Anthropic Claude Code CLI. Stage: implementation.
Requested model: "opus" (source: the AI loop stage model rule; passed to the CLI exactly as shown).
Actual model: awaiting authoritative CLI/session metadata.
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-31T11:19:28.728Z - Usage Orchestrator dispatch dispatch-mvwb6o1h-1 model observed
Card: card-mvq266pd-3. CLI: Anthropic Claude Code CLI. Stage: implementation.
Actual model: "claude-opus-5-5" (source: Claude Code stream-json system.init.model; attempt: dispatch-mvwb6o1h-1).

### 2026-10-31 - Baseline measured (Claude Code)
**Script.** Added `scripts/measure-findings.mjs <folder>`.
- It bundles the checker from `src/` with esbuild and runs `checkText` on every `.bib`, `.tex` and Markdown file under the folder.
- Lookups go through `createCrossrefClient` at its default limits. A fetch guard refuses every host but `api.crossref.org`.
- It writes `summary.json`, `summary.md` (counts by kind and severity, plus labelled shares) and `findings.tsv` (one line per finding, with a label column) to `.measure/`.
- `.measure/` is ignored by git, excluded in `.vscodeignore` and ignored by eslint. `--relabel --labels <file>` folds hand labels into an earlier run without new lookups.
- `vsce ls` shows no script or `.measure` file in the VSIX.

**Corpus.** Public reference lists, downloaded outside the repository and read as text only.
- Computer science: arXiv cs.CL and cs.SE sources (`.bib`, and `.tex` with `thebibliography`), plus chapters of a public systems book in Markdown.
- Life sciences: arXiv q-bio.GN and q-bio.PE sources, plus bioinformatics project READMEs with reference sections.
- Two arXiv `.bbl` files and one CS `.bbl` file were checked as `.tex`.

**Baseline.**
- 63 files, 1,437 entries (BibTeX 522, LaTeX 426, Markdown 489), 2,925 Crossref requests, no mailto. Cost: CAD $0.
- Entry status: verified 234, matched 257, unverified 582, not checked 186, DOI not found 75, other agency 14, skipped 89.
- 886 findings: unverified 582 (info), lookup-failed 186 (info), doi-not-found 75 (warning), other-agency 14 (info), title-differs 10 (warning), first-author-differs 8 (warning), year-differs 7 (warning), correction 2 (info), other-update 2 (info).

**Hand labels.** 116 findings labelled. Share labelled "not a problem" by kind:
- unverified: 22 of 22 (1.00)
- lookup-failed: 25 of 25 (1.00)
- doi-not-found: 25 of 26 (0.96; 1 can't tell)
- other-agency: 14 of 14 (1.00)
- title-differs: 8 of 10 (0.80)
- first-author-differs: 6 of 8 (0.75)
- year-differs: 6 of 7 (0.86)
- correction: 0 of 2
- other-update: 1 of 2 (0.50)

All 5 mismatch findings labelled "real problem" were a wrong DOI or a wrong year in the file.

**Main causes** (counts over all findings, not only the labelled sample):
1. **Markdown DOI extraction keeps trailing syntax.** 74 of 75 doi-not-found findings, all from Markdown: link text before `](...)`, emphasis markers, badge `.svg)` suffixes, closing quotes, `.pdf`, and a version path suffix.
2. **Crossref rate limiting without a mailto.** 185 of 186 lookup-failed findings were HTTP 429 at the default concurrency (13% of entries).
3. **Field names leak from LaTeX `ibinfo{field}{value}` bibliographies.** About 132 unverified findings in two `.tex` files.
4. **Unverified works that are real but not in Crossref.** Conference papers without Crossref DOIs, arXiv preprints (104 named as arXiv), books, standards, blogs and slides. This works as intended under L3, but it is the largest single group.
5. **Strict confident matching.** 102 unverified findings had a closest match at title similarity of 0.9 or more, partly because of cause 3. Others come from group authors and online-versus-print years. Online-versus-print years also explain the year-differs findings that were not problems.
6. **Non-reference content in Markdown reference sections.** Link reference definitions, HTML anchors whose text `stripUrls` swallows, step lists and link lists. Terse README citations without titles also raise title and author mismatches.

**Proposed Backlog cards.**
- `card-mvwbw2ni-1`: Markdown DOI syntax
- `card-mvwbw2ni-2`: LaTeX bibinfo
- `card-mvwbw2ni-3`: Crossref public-pool limits
- `card-mvwbw2ni-4`: non-reference Markdown content
- `card-mvwbw2ni-5`: confident matching (depends on -2)

Cause 4 needs no card: L3 already covers it.

`npm run check` passes (64 tests).

STATUS: DONE

### 2026-10-31T11:40:19.375Z - MWNN independent verification started

### 2026-10-31T11:40:19.450Z - Anthropic Claude Code CLI implementation handoff failed
Missing or invalid verification inputs. Configure .mwnn/verification.json, with a check mapping for every acceptance criterion, before dispatch.

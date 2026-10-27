---
id: card-mvq266pd-1
title: "Report a DataCite DOI as outside Crossref, not as unresolved"
column: col-mvfa2glc-5
position: -8000
assignee: { kind: ai }
createdAt: 1793067630961
updatedAt: 1793068675493
---

## Description
Found on 2026-10-26 by running the 0.1.0 CLI against live Crossref on a seven-entry machine-learning `.bib`. It held arXiv preprints, a NeurIPS paper, a CVPR paper, a book, a journal article and a Zenodo software DOI. Five entries got findings, and none was a problem with the reference. Two of them were P1 warnings on valid DOIs registered with DataCite: `10.48550/arXiv.1412.6980` (arXiv) and `10.5281/zenodo.591564` (Zenodo). "Does not resolve in Crossref" is true, but a user reads it as a broken reference.

Crossref's REST API names a DOI's registration agency at `GET /works/{doi}/agency`. It is on `api.crossref.org`, so it adds no host (AGENTS.md rule 1). Results checked on 2026-10-26:
- `10.48550/arxiv.1412.6980` → `datacite`
- `10.5281/zenodo.591564` → `datacite`
- `10.1038/nature14539` → `crossref`
- `10.5555/cite-ledger-unregistered-0000`, the P1 fixture → 404 "Resource not found."

Change (`src/core/crossref.ts`, `src/core/checker.ts`): when `GET /works/{doi}` answers 404, ask `/works/{doi}/agency`.
- **Another agency, such as DataCite.** Report an info finding saying the DOI is registered with that agency, which Cite Ledger does not check (L1). Evidence: the agency lookup and the doi.org link. Keep claim P1, because it still flags that the DOI is not in Crossref, but use severity info, not warning. The summary line and reports should count it apart from "DOI not found", for example as a new finding kind.
- **404 from the agency lookup.** Keep today's P1 warning. Its "could be wrong" text can now say that Crossref's agency lookup found no registration agency, and the DOI may be mistyped.
- **Agency lookup fails** (network error or 5xx after retries). Fall back to today's P1 warning, so no finding is lost.
- **Agency `crossref` but no work record** (rare). Today's P1 warning.

Possible extra scope, Darren to decide: an entry with no DOI that is an arXiv preprint (`eprint` with `archivePrefix = {arXiv}`, or `arXiv:NNNN.NNNNN` in `journal` or `note`) is searched today and marked unverified. Keep the search, because it can find a published version. When nothing matches, the unverified message would say the entry is an arXiv preprint whose DOI is registered with DataCite (L1).

Public text: the L1 paragraph in `docs/limits.md` says these DOIs are reported as "does not resolve in Crossref", so its wording changes. The L1 claim text in `docs/claim-register.json` does not change. Darren approves the new paragraph.

## Acceptance criteria
- [x] Darren's decisions are recorded in Activity before implementation: the new L1 paragraph for `docs/limits.md`, and whether the arXiv-preprint message is in scope.
- [x] A DOI that the agency lookup reports as DataCite gets an info finding that names the agency and points to L1, with the agency lookup and doi.org as evidence. It produces no warning.
- [x] A DOI that the agency lookup answers 404 for still gets the P1 warning, and the P1 claim test passes unchanged.
- [x] When the agency lookup fails, the result falls back to today's P1 warning.
- [x] The agency responses are recorded as fixtures in `test/fixtures/crossref/` and listed in `test/fixtures/README.md`. `test-live/` repeats those requests.
- [x] The P5 network test passes: every request goes to `api.crossref.org` and sends no prose.
- [x] The summary line, the Problems panel and the Markdown, CSV and JSON reports handle the new result.
- [x] `CHANGELOG.md` has an Unreleased entry. The claim register is not edited.
- [x] `npm run check` and `npm run test:live` pass.

## Activity
### 2026-10-27T02:24:37.526Z - Handed off to Claude Code
Dispatched this card to Claude Code. The agent should append its completion note below.

### 2026-10-27 - Claude Code: blocked on Darren's decisions
The first acceptance criterion requires Darren's decisions to be recorded here before implementation, and none are. No code, docs or fixtures were changed.

Needed from Darren:
1. **Approve, edit or replace the new L1 paragraph** for `docs/limits.md`. The bold L1 claim line stays unchanged. Proposed draft:

   > Cite Ledger looks DOIs up only in Crossref. Datasets, software and some preprints often have DataCite DOIs; Zenodo and arXiv DOIs are examples. When a DOI is not in Crossref, Cite Ledger asks Crossref which agency registered it. If another agency, such as DataCite, registered it, Cite Ledger reports an info finding naming that agency and does not check the work further. If no agency is found, or the lookup fails, it reports that the DOI "does not resolve in Crossref". Both findings link to `doi.org`, so you can see whether the DOI resolves elsewhere.

2. **Is the arXiv-preprint message in scope?** (An entry with no DOI but an arXiv `eprint`/`archivePrefix`, or `arXiv:NNNN.NNNNN` in `journal`/`note`, that matches nothing in the search gets an unverified message saying it is an arXiv preprint whose DOI is registered with DataCite, L1.) Yes / no / separate card.

Once both answers are recorded in this Activity section, re-dispatch the card.

Initially reported as blocked: needed Darren's approval of the new L1 paragraph for docs/limits.md and a decision on whether the arXiv-preprint message is in scope; resolved in interview on 2026-10-27 (see below).

### 2026-10-27T02:25:37.876Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-27 - Interview: draft L1 paragraph checked against the claim (verified evidence)
- `docs/claim-register.json` entry L1 is accepted with the text "Does not check DOIs registered outside Crossref, for example DataCite." The proposed paragraph agrees with it ("does not check the work further"), so the claim text needs no edit. Source: `grep '"L1"' docs/claim-register.json`.
- The current L1 paragraph in `docs/limits.md` (line 9) still says these DOIs are reported as "does not resolve in Crossref", so it is the paragraph that changes. Source: `docs/limits.md`.
- No script or `package.json` entry mentions `docs/limits.md`, so `npm run check:claims` does not scan it. Source: `grep -rn limits.md scripts/ package.json`.
- Both of Darren's decisions are still open. Next question: approval of the L1 paragraph.

### 2026-10-27 - Interview: Darren's decision 1, the L1 paragraph (user-reported)
- Question: Do you approve the proposed new L1 paragraph for `docs/limits.md` (it replaces line 9; the bold L1 claim line stays unchanged)?
- Answer: "approve". Source: reported by Darren McLeod in interview chat, 2026-10-27.
- Approved text, word for word:

  > Cite Ledger looks DOIs up only in Crossref. Datasets, software and some preprints often have DataCite DOIs; Zenodo and arXiv DOIs are examples. When a DOI is not in Crossref, Cite Ledger asks Crossref which agency registered it. If another agency, such as DataCite, registered it, Cite Ledger reports an info finding naming that agency and does not check the work further. If no agency is found, or the lookup fails, it reports that the DOI "does not resolve in Crossref". Both findings link to `doi.org`, so you can see whether the DOI resolves elsewhere.

- `docs/limits.md` is not edited yet: implementation waits until both decisions are recorded. Next question: whether the arXiv-preprint message is in scope.

### 2026-10-27 - Interview: Darren's decision 2, arXiv-preprint message (user-reported)
- Question: Should the arXiv-preprint unverified message be in scope for this card (yes / no / separate card)?
- Darren asked for a recommendation. Claude recommended "separate card": it changes a different code path (entry detection in the parsers, not the 404 handling) and needs its own fixtures, and it makes no request.
- Answer: "separate card". Source: reported by Darren McLeod in interview chat, 2026-10-27.
- The arXiv-preprint message is **out of scope** for this card. Created Backlog card `card-mvq2il44-1` "Say an unmatched arXiv preprint has a DataCite DOI" (`.mwnn/cards/card-mvq2il44-1.md`, depends on this card). Verified evidence: file written and reread.

### 2026-10-27 - Interview summary
- Met: criterion 1. Both of Darren's decisions are recorded above: the L1 paragraph is approved word for word, and the arXiv-preprint message goes to a separate card.
- Open: criteria 2 to 9. They are implementation and verification work (the agency lookup in `src/core/crossref.ts` and `src/core/checker.ts`, fixtures, `test-live/`, the P5 test, the summary line, Problems panel and reports, the `docs/limits.md` paragraph, the `CHANGELOG.md` entry, `npm run check` and `npm run test:live`). Nothing has been implemented yet.
- Unresolved exceptions: none. The blocker is cleared, and the card can be re-dispatched for implementation.

### 2026-10-27T02:33:44.632Z - Handed off to Claude Code
Dispatched this card to Claude Code. The agent should append its completion note below.

### 2026-10-27 - Claude Code: implemented the agency lookup
- `src/core/crossref.ts`: new `getAgency(doi)` on the client (cached like `getWork`) asks `GET https://api.crossref.org/works/{doi}/agency`; new `agencyEvidenceUrl`. No new host.
- `src/core/checker.ts`: when `/works/{doi}` answers 404, the checker asks the agency lookup. Another agency (such as DataCite): new finding kind `other-agency`, claim P1, severity info, entry status `other-agency`. The message names the agency and points to L1, and the evidence is the agency lookup and doi.org. A 404 from the agency lookup keeps the P1 warning, with "could be wrong" text saying no registration agency was found and the DOI may be mistyped. An agency of `crossref`, or a failed lookup (5xx after retries, network error), keeps today's P1 warning and text.
- Summary line ("DOIs registered outside Crossref"), Markdown/CSV/JSON report counts ("registered outside Crossref"), Problems panel (Information severity; the code links to `docs/limits.md#l1`) and CLI `--fail-on other-agency` (also in `any`) handle the new kind.
- Fixtures: `test/fixtures/crossref/agency-10.48550_arxiv.1412.6980.json` and `agency-10.5281_zenodo.591564.json`, recorded live on 2026-10-26, plus `test/fixtures/files/agency.bib`. All are listed in `test/fixtures/README.md`. `test/helpers.ts` serves `/agency` paths. `test-live/` now checks the arXiv and Zenodo DOIs (`other-agency`, DataCite) and the 404 agency text for the P1 fixture.
- Tests added: the DataCite info finding, the 404 → P1 warning, the 5xx and network-error fallbacks, the agency `crossref` fallback, summary and report handling. The P5 test now also checks `agency.bib`. The P1 claim test was not edited and passes.
- `docs/limits.md` L1 paragraph replaced with Darren's approved text, word for word. `CHANGELOG.md` has an Unreleased entry. `docs/claim-register.json` not edited.
- `npm run check` passed (51 tests, claims check, vsix packaged). `npm run test:live` passed against api.crossref.org. Nothing committed or pushed.

STATUS: DONE

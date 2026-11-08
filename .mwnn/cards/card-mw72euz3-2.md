---
id: card-mw72euz3-2
title: Weekly operations run - Nov 8
column: col-mvfa2glc-3
position: 1000
assignee: { kind: human }
createdAt: 1794095960655
updatedAt: 1794169401618
---

## Description
Run the weekly operations task in the private operating runbook: `plans/cite-ledger-runbook.md` in the company repository. Darren dispatches it by hand, because the project is enrolled as manual-dispatch.

Scope:
- the Crossref live-test status;
- issue triage;
- Discussions replies within the standing instruction;
- at most one T1 article;
- the publication log;
- the weekly log for Darren.

Escalations follow AGENTS.md. Anything involving money, licences or personal data goes to the company board.

At the end of the run, create next week's operations card in this board's Backlog. Its description and criteria are the same, and it has no `dependsOn`.

## Acceptance criteria
- [x] The standing instruction was confirmed in force and unexpired before anything was published.
- [x] Every item published is in `docs/publication-log.md`, within the volume limits.
- [x] The weekly log, with any escalations, is written for Darren's review.
- [x] Next week's operations card exists.

## Activity
### 2026-11-08T20:23:21.585Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-11-08T20:24:00Z - Checks run in this session (verified evidence)
Run in Claude Code at 2026-11-08 20:23 UTC, which is 14:23 America/Regina, inside the 06:00–21:00 window.
- **Runbook read:** `plans/cite-ledger-runbook.md` in the company checkout `e:/101245880sasktatchewanltd`.
- **Standing instruction:** in force and unexpired. Source: §8 of `plans/autonomous-profit-project-research-2026-10-19.md` (decision record: accepted 2026-10-19, expires 2027-01-17, no "Revoked" status line; no uncommitted change to the file, last changed in commit `5622b63` of 2026-10-25), and the "Accept" entry on `card-mvctur05-1`. The renewal card `card-mvfa7k2p-2` has no decision yet, which is expected before 2027-01-17.
- **Crossref live:** workflow `active` (`gh workflow list`). Latest scheduled run [41461586815](https://github.com/Tempuskg/cite-ledger/actions/runs/41461586815), 2026-11-02T14:24Z, succeeded. The next scheduled run is Monday 2026-11-09. No re-enable needed.
- **Issue triage:** `gh issue list --state all` returns no issues, open or closed. No pull requests (`gh pr list --state all`). Nothing to label; no wrong-finding report, so stop condition 1 does not apply.
- **Discussions:** enabled, 0 threads (GraphQL `discussions.totalCount = 0`). No replies due; 0 of 10 this week.
- **Publication log this week (2026-11-08 to 2026-11-14):** 0 items. November so far: 1 T1 article (2026-11-07). One T1 article is allowed this week (1/week, 3 left of 4 in November).
- **Stop condition 5:** the previous weekly log (`card-mvolel0t-1`) was acknowledged 2026-11-08T00:02Z, so it does not apply.
- **Released version:** `0.1.1` (`package.json`, tags `v0.1.0`, `v0.1.1`).
- **Local, unreleased fixes:** `card-mvwbw2ni-1` to `-5` and `card-mw72euz3-1` all show `STATUS: DONE`, but their changes (`src/core/*.ts`, tests, fixtures) are uncommitted in the working tree and not in any release. Users still run 0.1.1, so a T1 article this week should describe 0.1.1 behaviour and avoid Markdown DOI parsing, LaTeX `\bibinfo`, rate limits, "Unverified" matching and quoting the `first-author-differs` line on retracted, corrected or questioned works. The runbook expects an agent to prepare a release on a product-board card once defects are fixed; pushing the tag is Darren's approval.
- **Escalations so far:** none.

### 2026-11-08T20:25:00Z - T1 article topic chosen
Q: Which T1 article this week: BibTeX corrections and expressions of concern, none, or another topic?
A: "BibTeX corrections & EoC (Recommended)". Reported by Darren McLeod in interview chat, 2026-11-08. User-reported. The agent drafts it against 0.1.1 behaviour and runs `npm run check`; publishing (push to `main`) waits for Darren's go-ahead and must happen before 21:00 America/Regina.

### 2026-11-08T20:31:00Z - T1 article drafted and checked (verified evidence)
- **Draft:** `site/articles/how-to-check-bibtex-references-for-corrections-and-expressions-of-concern.html`, linked first in the Articles list in `site/index.html` (dated 2026-11-08). Template T1. Claims P2, P5, P6, L1–L3, each word for word with `data-claim`. Not yet committed or published.
- **Problem source:** Crossref Crossmark documentation (https://www.crossref.org/documentation/crossmark/, "Last updated: 2020-April-08"), read via web fetch on 2026-11-08; the quoted sentence is verbatim from that page. The COPE retraction guidelines page was also tried and returned HTTP 403, so it is not used.
- **Examples chosen from Crossref (`api.crossref.org/works/<DOI>`, 2026-11-08):** `10.1371/journal.pone.0161231` has only a correction (notice `10.1371/journal.pone.0301214`, 2024-03-21, publisher). `10.1371/journal.pone.0061107` has an expression of concern (notice `10.1371/journal.pone.0278805`, 2023-01-11, Retraction Watch and publisher), the same work as the test fixture. A first candidate, `10.1371/journal.pone.0292284`, was dropped because Crossref also records a later retraction for it.
- **Worked example:** run with the released CLI asset `cite-ledger-cli-v0.1.1.js` from GitHub release `v0.1.1` (`gh release download`), 2026-11-08. Output: one `P2 correction` and one `P2 expression-of-concern` finding, as quoted in the article. The example entries have no `author` field, so no author is named anywhere in the output or the article.
- **Checks:** `npm run check` exit 0, run 2026-11-08 ~14:30 America/Regina: lint and types, `npm test` 86 pass / 0 fail, claim check passed (13 register entries), package built. The working tree also holds the uncommitted fixes from `card-mvwbw2ni-1` to `-5` and `card-mw72euz3-1`; the article commit will include only the article, `site/index.html` and `docs/publication-log.md`.
- **Side effect noted:** `npm run vsix` rewrites the git-ignored local `cite-ledger-0.1.1.vsix` from the working tree, so that local file now holds unreleased code under the released version number. Worked examples should use the release asset (as here), not the local VSIX.
- **Observation for the weekly log:** the "could be wrong" text for every Crossref notice, including expressions of concern and retractions, reads "A correction may leave the findings intact." (`src/core/checker.ts:123`, unchanged in the local fixes). It is accurate for corrections but not tailored to the other notice types. The article does not quote that line.

### 2026-11-08T20:31:30Z - Go-ahead to publish the T1 article
Q: "May I publish the T1 article "How to check BibTeX references for corrections and expressions of concern" now?"
A: "Yes, publish". Reported by Darren McLeod in interview chat, 2026-11-08. User-reported.
Pre-publish check (verified evidence), 2026-11-08 14:31 America/Regina (20:31:46Z): §8 of `plans/autonomous-profit-project-research-2026-10-19.md` still shows the 2026-10-19 acceptance and 2027-01-17 expiry, with no "Revoked" status line and no uncommitted change to the file. Inside 06:00–21:00. 0 prior T1 this week, 1 this month. Local `main` in sync with `origin/main`. Row added to `docs/publication-log.md`.

### 2026-11-08T20:38:00Z - Published, deployed and logged (verified evidence)
Commit `8f685a6` (the article, `site/index.html` and `docs/publication-log.md` only) pushed to `main` at 2026-11-08 14:32 America/Regina. CI run [42520616439](https://github.com/Tempuskg/cite-ledger/actions/runs/42520616439) and Product page run [42520616318](https://github.com/Tempuskg/cite-ledger/actions/runs/42520616318) both succeeded. https://tempuskg.github.io/cite-ledger/articles/how-to-check-bibtex-references-for-corrections-and-expressions-of-concern.html returns HTTP 200.

### 2026-11-08T20:40:00Z - Weekly log for Darren (week of 2026-11-08 to 2026-11-14)
**Standing instruction.** In force, accepted 2026-10-19, expires 2027-01-17, not revoked. Checked at 14:23 and again at 14:31 America/Regina, right before publishing (verified evidence).

**Crossref live.** Workflow active. Scheduled run [41461586815](https://github.com/Tempuskg/cite-ledger/actions/runs/41461586815) on 2026-11-02 succeeded; the next is due Monday 2026-11-09. No re-enable needed.

**Issue triage.** No issues, open or closed, and no pull requests. Nothing labelled. No wrong-finding report.

**Discussions.** 0 threads. 0 replies, out of a limit of 10 a week.

**Published this run (all in `docs/publication-log.md`):**
1. T1 article "How to check BibTeX references for corrections and expressions of concern", with an index link. 1 of 1 this week, 2 of 4 in November. Claims P2, P5, P6, L1–L3. Worked example run with the released `v0.1.1` CLI asset; no author named.

**Drafts waiting for Darren.** None.

**Escalations (product board, Backlog, unassigned):**
- `card-mw8anibc-2`, "Prepare release 0.1.2 with the findings-quality and author-name fixes". The six done fixes (`card-mvwbw2ni-1` to `-5`, `card-mw72euz3-1`) are still uncommitted in the working tree, so users run 0.1.1 without them. Pushing the tag is your approval.
- `card-mw8anibc-3`, "Word the could-be-wrong note to fit each Crossref notice type". Every P2 finding says "A correction may leave the findings intact.", including expressions of concern and retractions. Not a wrong finding; the published article does not quote the line.
- Company board: none. Nothing involved money, licences or personal data.

**Note.** `npm run check` rebuilds the git-ignored local `cite-ledger-0.1.1.vsix` from the working tree, so that file no longer matches the release. Worked examples now use the GitHub release asset.

**Stop conditions.** None apply. Last week's log was acknowledged 2026-11-08T00:02Z.

**Waiting on Darren.**
- Acknowledge this log here within 14 days, by 2026-11-22 (stop condition 5).
- Decide when to prepare and approve the 0.1.2 release (`card-mw8anibc-2`).
- Renew or end the standing instruction by 2027-01-17 (`card-mvfa7k2p-2`, company board).

**Next week.** `card-mw8anibc-1`, "Weekly operations run - Nov 15", is in Backlog. It has the same description and criteria, no `dependsOn`, and the same assignee as this card (human).

### 2026-11-08T20:42:00Z - Closing summary
All four acceptance criteria are met, each by the verified evidence above.
- **Instruction confirmed before publishing:** yes, checked at 14:31 America/Regina, before the 14:32 push of `8f685a6`.
- **Every item published is in the log, within the limits:** yes, 1 T1 article (1/week, 2/4 in November); its row is in `docs/publication-log.md`.
- **Weekly log written:** yes, in the entry above, with two product-board escalations and none for the company board.
- **Next week's card:** `card-mw8anibc-1` is in Backlog.

The topic choice and the go-ahead to publish are user-reported. No unresolved exceptions. This card's column and assignee were not changed; moving it is left to the board's column rules.
STATUS: DONE

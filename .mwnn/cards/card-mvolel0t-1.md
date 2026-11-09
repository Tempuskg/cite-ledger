---
id: card-mvolel0t-1
title: Weekly operations run - Nov 1
column: col-mvfa2glc-5
position: -17000
assignee: { kind: human }
createdAt: 1792979003117
updatedAt: 1794103127249
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
### 2026-11-07T23:08:48.795Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-11-07T23:12:00Z - Checks run in this session (verified evidence)
Run in Claude Code at 2026-11-07 23:09 UTC, which is 17:09 America/Regina, inside the 06:00–21:00 window.
- **Runbook read:** `plans/cite-ledger-runbook.md` in the company checkout `e:/101245880sasktatchewanltd`.
- **Standing instruction:** in force and unexpired. Source: §8 of `plans/autonomous-profit-project-research-2026-10-19.md` (decision record: accepted 2026-10-19, expires 2027-01-17, no "Revoked" status line), and the "Accept" entry on `card-mvctur05-1`. The renewal card `card-mvfa7k2p-2` has no decision recorded yet, which is expected before 2027-01-17.
- **Crossref live:** workflow `active` (`gh workflow list`). Latest scheduled run [41461586815](https://github.com/Tempuskg/cite-ledger/actions/runs/41461586815), 2026-11-02T14:24Z, succeeded. No re-enable needed.
- **Issue triage:** `gh issue list --state all` returns no issues, open or closed. Nothing to label; no wrong-finding report, so stop condition 1 does not apply. No pull requests.
- **Discussions:** enabled, 0 threads (GraphQL `discussions.totalCount = 0`). No replies due; 0 of 10 this week.
- **Publication log this week (2026-11-01 to 2026-11-07):** 0 items. The latest row is the `v0.1.1` T2 changelog of 2026-10-31, which falls in the previous week. T1 articles: 0 this week, 0 in November. One T1 article is allowed.
- **Stop condition 5:** no acknowledgement of the previous weekly log (`card-mvfa2glc-7`, written 2026-10-26T01:45Z) is recorded on either board. Its 14-day window ends 2026-11-09T01:45Z (2026-11-08 19:45 America/Regina).
- **Backlog cards `card-mvwbw2ni-1` to `-5`:** findings-quality defects from the internal baseline on `card-mvq266pd-3`, not user reports. They do not trigger stop condition 1, but they affect Markdown DOI parsing, LaTeX `\bibinfo` entries, rate limits and "Unverified" matches, so a T1 article should avoid those capabilities until they are fixed.
- **Escalations so far:** none.

### 2026-11-07T23:15:00Z - Previous weekly log acknowledged
Q: "Do you acknowledge that log now [the weekly log on `card-mvfa2glc-7`], so I can record it on that card?"
A: "Yes, acknowledge it". Reported by Darren McLeod in interview chat, 2026-11-07. User-reported. Recorded in `card-mvfa2glc-7` Activity; stop condition 5 does not apply.

### 2026-11-07T23:20:00Z - T1 article topic chosen
Q: Which T1 article this week: BibTeX unresolved DOIs, BibTeX corrections and expressions of concern, or none?
A: "BibTeX unresolved DOIs (Recommended)". Reported by Darren McLeod in interview chat, 2026-11-07. User-reported. The agent drafts it and runs `npm run check`; publishing (push to `main`) waits for Darren's go-ahead and must happen before 21:00 America/Regina.

### 2026-11-07T23:28:00Z - T1 article drafted and checked (verified evidence)
- **Draft:** `site/articles/how-to-check-bibtex-references-for-unresolved-dois.html`, linked from the Articles list in `site/index.html` (dated 2026-11-07). Template T1. Claims P1, P2, P5, P6, L1–L3, each word for word with `data-claim`. Not yet committed or published.
- **Problem source:** Crossref blog "DOIs and matching regular expressions", 2015-08-11, read via web fetch; the quoted sentence is verbatim from that page. A Scientometrics paper was considered and dropped, because its page was behind a login and could not be read.
- **Worked example:** run with the released 0.1.1 CLI (`dist/cli.js` from the local `cite-ledger-0.1.1.vsix`, unpacked to the scratchpad), 2026-11-07. A one-digit-short DOI `10.1016/S0140-6736(97)1109-0` gave `P1 doi-not-found` (Crossref works 404, no agency, doi.org 404). The correct DOI `10.1016/S0140-6736(97)11096-0` gave `P2 retraction` (notice `10.1016/s0140-6736(10)60175-4`, 2010-02-06) and `P2 correction`. The DataCite DOI `10.48550/arXiv.1706.03762` gave `P1 other-agency` (Crossref agency endpoint: DataCite).
- **Authors not named:** the run's `P3 first-author-differs` line for the retracted DOI prints that work's first author's surname from Crossref. The article does not quote that line or name any author.
- **Checks:** `npm run check` passed: lint and types, `npm test` 64 pass / 0 fail, claim check passed (13 register entries), package built. Run 2026-11-07 ~17:25 America/Regina.
- **Possible escalation:** AGENTS.md rule 4 says findings never name the authors of retracted or questioned work, but on a retracted DOI the `first-author-differs` finding shows the Crossref first author. To go on this board as a card, with no names in it.

### 2026-11-07T23:58:00Z - Go-ahead to publish the T1 article
Q: "May I publish it now?" (the T1 article, by committing and pushing to `main`).
A: "Yes, publish". Reported by Darren McLeod in interview chat, 2026-11-07. User-reported.
Pre-publish check (verified evidence), 2026-11-07 17:58 America/Regina: §8 of `plans/autonomous-profit-project-research-2026-10-19.md` still shows the 2026-10-19 acceptance and 2027-01-17 expiry, with no "Revoked" status line and no uncommitted change to the file. Inside 06:00–21:00. 0 prior T1 this week and this month. Row added to `docs/publication-log.md`.

### 2026-11-07T23:59:00Z - Published, deployed and logged (verified evidence)
Commit `9cc90ba` pushed to `main` at 2026-11-07 17:58 America/Regina. CI run [42427616487](https://github.com/Tempuskg/cite-ledger/actions/runs/42427616487) and Product page run [42427616442](https://github.com/Tempuskg/cite-ledger/actions/runs/42427616442) both succeeded. https://tempuskg.github.io/cite-ledger/articles/how-to-check-bibtex-references-for-unresolved-dois.html returns HTTP 200.

### 2026-11-07T23:59:30Z - Weekly log for Darren (week of 2026-11-01 to 2026-11-07)
**Standing instruction.** In force, accepted 2026-10-19, expires 2027-01-17, not revoked. Checked at 17:09 and again at 17:58 America/Regina, right before publishing (verified evidence).

**Crossref live.** Workflow active. Scheduled run [41461586815](https://github.com/Tempuskg/cite-ledger/actions/runs/41461586815) on 2026-11-02 succeeded. No re-enable needed.

**Issue triage.** No issues, open or closed, and no pull requests. Nothing labelled. No wrong-finding report.

**Discussions.** 0 threads. 0 replies, out of a limit of 10 a week.

**Published this run (all in `docs/publication-log.md`):**
1. T1 article "How to check BibTeX references for unresolved DOIs", with an index link. 1 of 1 this week, 1 of 4 in November. Claims P1, P2, P5, P6, L1–L3.

**Drafts waiting for Darren.** None.

**Escalations.**
- Product board: `card-mw72euz3-1`, "Keep authors of retracted works out of first-author findings" (Backlog). When the retracted example DOI was checked with a placeholder author, the 0.1.1 `first-author-differs` finding printed the Crossref first author's surname. That conflicts with AGENTS.md rule 4. The published articles don't quote it. A fix needs a release, which is your approval.
- Company board: none. Nothing involved money, licences or personal data.

**Stop conditions.** None apply. Your acknowledgement of the previous log was recorded on `card-mvfa2glc-7` today.

**Waiting on Darren.**
- Acknowledge this log here within 14 days, by 2026-11-21 (stop condition 5).
- Renew or end the standing instruction by 2027-01-17 (`card-mvfa7k2p-2`, company board).

**Next week.** `card-mw72euz3-2`, "Weekly operations run - Nov 8", is in Backlog. It has the same description and criteria, no `dependsOn`, and the same assignee as this card (human).

### 2026-11-07T23:59:45Z - Closing summary
All four acceptance criteria are met, each by the verified evidence above.
- **Instruction confirmed before publishing:** yes, checked at 17:58 America/Regina before the 17:58 push.
- **Every item published is in the log, within the limits:** yes, 1 T1 article.
- **Weekly log written:** yes, in the entry above.
- **Next week's card:** `card-mw72euz3-2` is in Backlog.

The previous-log acknowledgement, the topic choice and the go-ahead to publish are user-reported. No unresolved exceptions. This card's column and assignee were not changed; moving it is left to the board's column rules.
STATUS: DONE

### 2026-11-08T00:00:15Z - Go-ahead to push the board record
Q: "Should I push `0a90941` to `main`?"
A: "Yes". Reported by Darren McLeod in interview chat, 2026-11-07. User-reported. Pushed with this entry.

### 2026-11-08T00:02:30Z - Weekly log acknowledged by Darren
Q: Acknowledge this week's weekly log (entry 2026-11-07T23:59:30Z above)?
A: "Acknowledge it". Reported by Darren McLeod in interview chat, 2026-11-07 (18:02 America/Regina). User-reported. This resets the 14-day window in stop condition 5. The card's status is unchanged.

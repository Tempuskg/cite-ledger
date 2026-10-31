---
id: card-mvfa2glc-7
title: First weekly operations run after launch
column: col-mvfa2glc-5
position: -7000
assignee: { kind: ai }
createdAt: 1792415841150
updatedAt: 1792979263932
dependsOn: [card-mvfa2glc-6]
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
### 2026-10-26T01:41:33.739Z - Handed off to GitHub Copilot
Dispatched this card to GitHub Copilot. The agent should append its completion note below.

### 2026-10-26T01:45:00Z - Weekly operations run (first after launch)
**Standing instruction.** Confirmed before publish: accepted 2026-10-19 on `card-mvctur05-1` ("Accept"); in force; expires 2027-01-17; status line not revoked; launch done 2026-10-25. Window ~19:43–19:45 America/Regina (inside 06:00–21:00).

**Crossref live.** Workflow active. On-demand run [40255548518](https://github.com/Tempuskg/cite-ledger/actions/runs/40255548518) completed success (2026-10-26T01:42:45Z). Prior scheduled success 2026-10-19. Next Monday schedule still enrolled.

**Issue triage.** Open issues: 0. Nothing to label; no wrong-finding stop.

**Discussions.** No threads. No T3–T5 replies. Cap unused (0/10 week, 0/2 per thread).

**Published this run (logged in `docs/publication-log.md`):**
1. T1 article: `site/articles/how-to-check-bibtex-references-for-retractions.html` + index link (1/1 week, 1/4 month).
2. README: removed obsolete pre-release banner; added Marketplace / Open VSX / product-page install links (no new claims).

**Drafts waiting for Darren.** None (no issue comments or off-channel items).

**Escalations.** None to the product board or company board this week.

**Notes for Darren.** Please acknowledge this weekly log (stop condition 5: publishing pauses if unacknowledged for 14 days). Renew standing instruction by 2027-01-17 (`card-mvfa7k2p-2` on the company board).

**Next week.** Backlog card `card-mvolel0t-1` created (same description/criteria; no `dependsOn`).

STATUS: DONE

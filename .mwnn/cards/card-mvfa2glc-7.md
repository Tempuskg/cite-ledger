---
id: card-mvfa2glc-7
title: First weekly operations run after launch
column: col-mvfa2glc-1
position: 4000
assignee: { kind: ai }
createdAt: 1792415841150
updatedAt: 1792415841150
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
- [ ] The standing instruction was confirmed in force and unexpired before anything was published.
- [ ] Every item published is in `docs/publication-log.md`, within the volume limits.
- [ ] The weekly log, with any escalations, is written for Darren's review.
- [ ] Next week's operations card exists.

## Activity

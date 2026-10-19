---
id: card-mvfa2glc-3
title: Hands-on acceptance test and launch claim review
column: col-mvfa2glc-2
position: 3000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792415841150
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
- [ ] Darren ran the extension on a real reference file, and his verdict is recorded in Activity, including any wrong finding, which becomes its own card.
- [x] Each of P7–P10 is recorded as accepted or rejected, and `docs/claim-register.json` matches.
- [ ] The listing text is approved, or the changes he asked for are made, and `npm run check` passes.

## Activity
### 2026-10-19 - Claim review, part 2 (recorded by Claude Code)
Q: "Which proposed public claims do you accept?"
A: "P7 file types, P8 Pro features, P9 no AI calls, P10 licence check". Darren McLeod, 2026-10-19.

All four are now marked accepted in `docs/claim-register.json` and `docs/claim-register.md`. The README now carries P7, P9 and P10. P8 waits for the release card, `card-mvfa2glc-5`, so that it appears together with P6 and the live price. The hands-on test and the listing-text approval are still open.

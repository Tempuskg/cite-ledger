---
id: card-mvfa2glc-1
title: Create the Polar product and licence-key benefit, and set the Pro price
column: col-mvfa2glc-2
position: 1000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792415841150
---

## Description
Pro is unlocked by a Polar licence key, validated from the client with public identifiers only (`src/core/license.ts`). Until a benefit id is set there, Pro stays locked: it fails closed. Only Darren can do this, because it is an account and money action.

**Price decided: USD $12 one-time.** Darren chose "USD $12 one-time (Recommended)" on 2026-10-19, recorded on company card `card-mvf572fm-1`.

Steps:
1. In the existing Polar organization (`9a3f3f03-1384-425b-8a7a-54866b7d634a`, the one MWNN Kanban Pro uses), create a one-time product named "Cite Ledger Pro" at USD $12.
2. Give it a **License Keys** benefit. Leave any activation limit off, because the client validates keys and does not activate them.
3. Give the agent two things: the **benefit id**, and the public **checkout or product page URL**.

No card run may hold a Polar credential, so the agent cannot do these steps.

## Acceptance criteria
- [ ] The Polar product exists in the existing organization at the price Darren set.
- [ ] It has a License Keys benefit.
- [ ] The benefit id is set in `POLAR_BENEFIT_ID` in `src/core/license.ts`.
- [ ] The product page URL is recorded as `productUrl` for P6 in `docs/claim-register.json`.
- [ ] A test key validates against Polar, and a key for another product, such as an MWNN Kanban Pro key, is refused.

## Activity

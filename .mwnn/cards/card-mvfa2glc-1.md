---
id: card-mvfa2glc-1
title: "Create the Polar product and licence-key benefit, and set the Pro price"
column: col-mvfa2glc-5
position: 1000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792454001602
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
- [x] The Polar product exists in the existing organization at the price Darren set.
- [x] It has a License Keys benefit.
- [x] The benefit id is set in `POLAR_BENEFIT_ID` in `src/core/license.ts`.
- [x] The product page URL is recorded as `productUrl` for P6 in `docs/claim-register.json`.
- [x] A test key validates against Polar, and a key for another product, such as an MWNN Kanban Pro key, is refused.

## Activity
### 2026-10-19T13:47:35.494Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-19 - Workspace state checked by the agent (verified evidence)
- `src/core/license.ts:7` has `POLAR_ORGANIZATION_ID = '9a3f3f03-1384-425b-8a7a-54866b7d634a'`, which matches the organization named in this card. `src/core/license.ts:9` still has `POLAR_BENEFIT_ID = ''`, so Pro fails closed (`src/core/license.ts:34-36`).
- `test/pro.test.ts:139` accepts only an empty benefit id or a 36-character UUID-form id (`/^$|^[0-9a-f-]{36}$/`).
- `docs/claim-register.json` P6 has `"productUrl": null` and `"requiresLiveProduct": true`. `scripts/check-claims.mjs:61-63` fails any public use of P6 until `productUrl` is set.
- `card-mvfa2glc-5` (Prepare the 0.1.0 release) depends on this card.
- The agent holds no Polar credential and has not contacted Polar. Nothing in the workspace shows whether the product exists yet.

### 2026-10-19 - Q: Has the "Cite Ledger Pro" product been created in Polar? (user-reported)
A: "Not yet, step me through creating it". Reported by Darren McLeod in interview chat, 2026-10-19. The product does not exist yet. The agent is walking Darren through creating it in the Polar dashboard; Darren does the steps himself.

### 2026-10-19 - Q: What is the License Keys benefit's id? (user-reported)
A: Darren gave the dashboard link `https://polar.sh/dashboard/101245880-saskatchewan-ltd/products/benefits/6474b7e4-7fae-4610-92f6-08d1ba2a4398`. Reported by Darren McLeod in interview chat, 2026-10-19. Benefit id: `6474b7e4-7fae-4610-92f6-08d1ba2a4398`. The agent has not seen the benefit's type or the product's price itself.

### 2026-10-19 - Benefit id set and checks run by the agent (verified evidence)
- `src/core/license.ts:9` now reads `POLAR_BENEFIT_ID = '6474b7e4-7fae-4610-92f6-08d1ba2a4398'`, and the comment on line 8 is updated. The id is the one Darren reported; this entry verifies only the code change.
- `npm run check` passed: lint, 37 tests with 0 failing (including the UUID-form check at `test/pro.test.ts:139`), the claim check (13 register entries) and `vsce package`.
- Not committed yet.

### 2026-10-19 - Checkout page screenshot from Darren (user-supplied; read by the agent)
Darren shared a screenshot of an Incognito Chrome window, so he was signed out. It shows a Polar checkout for seller "101245880 Saskatchewan Ltd", product "Cite Ledger Pro", price US$12, total US$12, and the text "This is a one-time charge." This supports criterion 1 (product exists at USD $12 one-time). It does not show the organization id, and the agent did not load the page itself, so criterion 1 stays unchecked for now.
The address bar shows `polar.sh/checkout/polar_c_…`. That is a single checkout session, which Polar creates per visit and which expires, not the reusable checkout link. It is not recorded as `productUrl`. The agent asked for the reusable link the session was opened from.

### 2026-10-19 - Q: What is the reusable checkout link URL? (user-reported)
A: `https://buy.polar.sh/polar_cl_sTahdpEXRlwOfOi2HwXgYerl2LRAoQTpoGNr909TkK1`. Reported by Darren McLeod in interview chat, 2026-10-19. Darren opened this link signed out, and it led to the checkout shown in the screenshot above. The agent did not open the link itself, because each visit creates a checkout session.

### 2026-10-19 - productUrl recorded and checks rerun by the agent (verified evidence)
- `docs/claim-register.json` P6 now has `"productUrl": "https://buy.polar.sh/polar_cl_sTahdpEXRlwOfOi2HwXgYerl2LRAoQTpoGNr909TkK1"`. No other field changed. Parsed with `node` (valid JSON; P6 read back with the new value).
- `npm run check` passed again: 37 tests with 0 failing, the claim check (13 entries) and `vsce package`.
- Plan for criteria 1 and 2: the test-key check (criterion 5) sends organization id `9a3f3f03-…d634a` and the benefit id to Polar's validate endpoint. A `granted` result for a Cite Ledger Pro key would show that a License Keys benefit with this id exists in that organization.
- Not committed yet.

### 2026-10-19 - Q: How should the test key be obtained: a 100% discount code, or buying at $12? (user-reported)
A: "Discount code". Reported by Darren McLeod in interview chat, 2026-10-19. Darren will create a 100% discount limited to Cite Ledger Pro with 1 redemption, check out at $0, and run the validation himself with the key in an environment variable. The key goes in neither the chat nor the card.

### 2026-10-19 - Test script prepared by the agent (verified evidence)
The agent wrote a scratch script (in this session's scratchpad, outside the repo) that loads the compiled `dist-test/src/core/license.js` and calls `validateLicenseKey` with the key from env `CITE_LEDGER_TEST_KEY`. It prints the org id, benefit id and result, never the key. A dry run with an empty key printed organization `9a3f3f03-1384-425b-8a7a-54866b7d634a`, benefit `6474b7e4-7fae-4610-92f6-08d1ba2a4398`, and `{"valid":false,"reason":"No licence key entered."}`, with no network call.

### 2026-10-19 - Q: Did the checkout drop to US$0, and how? (user-reported)
A: "number 2 worked". Reported by Darren McLeod in interview chat, 2026-10-19. Darren had reported seeing no discount-code field on the public checkout link. Option 2 worked: a separate private test checkout link with the 100% discount reached US$0. The public link was left unchanged. Clean-up still to do: delete the test checkout link and the discount after the test.

### 2026-10-19 - Test 1: Cite Ledger Pro key against Polar (user-reported output)
Darren ran the test script himself with the Cite Ledger Pro key from the $0 test checkout. The key was not shared. He pasted this output in interview chat on 2026-10-19:
```
organization 9a3f3f03-1384-425b-8a7a-54866b7d634a, benefit 6474b7e4-7fae-4610-92f6-08d1ba2a4398
{"valid":true}
```
By `src/core/license.ts:39-58`, `valid: true` is returned only when Polar's validate endpoint, called with that org id and benefit id, answers 2xx with `status: "granted"` and the same `benefit_id`. So a licence-key benefit with id `6474b7e4-…4398` exists in organization `9a3f3f03-…d634a`, and it issued this key.

### 2026-10-19 - Test 2: MWNN Kanban Pro key against Polar (user-reported output)
Darren ran the same script with an MWNN Kanban Pro key. The key was not shared. He pasted this output in interview chat on 2026-10-19:
```
organization 9a3f3f03-1384-425b-8a7a-54866b7d634a, benefit 6474b7e4-7fae-4610-92f6-08d1ba2a4398
{"valid":false,"reason":"Polar does not recognise this key for Cite Ledger Pro."}
```
By `src/core/license.ts:45-46`, this reason means Polar answered 404 or 422 for that key under the Cite Ledger Pro benefit, so a key for another product in the same organization is refused.

### 2026-10-19 - Interview summary
Criteria:
1. **Met.** The product exists in the existing organization at USD $12 one-time. Evidence: Darren's signed-out checkout screenshot ("Cite Ledger Pro", US$12, "This is a one-time charge", seller 101245880 Saskatchewan Ltd), and test 1, where Polar granted a key from this product's benefit within organization `9a3f3f03-…d634a`. Both are user-reported or user-supplied.
2. **Met.** It has a License Keys benefit: id `6474b7e4-7fae-4610-92f6-08d1ba2a4398` (user-reported), and it issued a key that Polar validates (test 1, user-reported output).
3. **Met** (verified evidence). `POLAR_BENEFIT_ID` is set at `src/core/license.ts:9`, and `npm run check` passed.
4. **Met** (verified evidence). P6 `productUrl` in `docs/claim-register.json` is set to the reusable checkout link, the JSON parses, and `npm run check` passed.
5. **Met.** Test 1 returned `valid: true`, and test 2 refused an MWNN Kanban Pro key. Both outputs are user-reported; the key values are recorded nowhere.

No unresolved exceptions. Follow-ups that are not criteria:
- Darren to delete the private test checkout link and the 100% discount in Polar.
- The repository changes still need committing and pushing.
- The card's column is left to the board's rules. `card-mvfa2glc-5` can now use the benefit id and the P6 URL.

Follow-up on 2026-10-19 (user-reported): Darren deleted the private test checkout link and asked for the changes to be committed and pushed to `main`. At the time he had not said whether the 100% discount was deleted; its one redemption was already used. Later the same day (user-reported, interview chat, 2026-10-19), Darren said he had deleted the 100% discount code. Polar clean-up is complete.
STATUS: DONE

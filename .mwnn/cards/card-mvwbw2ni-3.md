---
id: card-mvwbw2ni-3
title: Keep within Crossref's public-pool limits when no mailto is set
column: col-mvfa2glc-1
position: 7000
createdAt: 1793446752148
updatedAt: 1793446752148
---

## Description
With no mailto set, the baseline's 1,437 entries gave 185 "Not checked" findings, about 13%, all after Crossref answered 429 Too Many Requests. It used the client's default concurrency of 3 and 200 ms spacing, which is also what the extension and CLI use when `citeLedger.mailto` is empty. Most users never set a mailto, so a long reference list loses checks. Choose limits from Crossref's published public- and polite-pool rules. Possible changes: lower concurrency without a mailto, longer backoff, or a summary line suggesting a mailto.

Found by the findings baseline on `card-mvq266pd-3` (`scripts/measure-findings.mjs`).

## Acceptance criteria
- [ ] Lookups without a mailto stay within Crossref's published public-pool limits. The retry policy is described in a code comment with its source.
- [ ] A test covers repeated 429 answers that include Retry-After.
- [ ] A baseline rerun without a mailto has at most 1% "Not checked" findings.
- [ ] Only `api.crossref.org` is contacted (P5 tests unchanged and passing).
- [ ] `npm run check` passes.

## Activity

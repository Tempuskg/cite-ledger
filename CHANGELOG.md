# Changelog

## Unreleased: 0.1.0

First version, not yet released. Each claim below is in the [claim register](docs/claim-register.md) and backed by the named test.

- Flags references whose DOI does not resolve in Crossref. (P1; `test/claims.test.ts`)
- Flags retractions, corrections and expressions of concern recorded in Crossref, including Retraction Watch data. (P2; `test/claims.test.ts`)
- Shows where an entry's title, year or first author differs from the Crossref record. (P3; `test/claims.test.ts`)
- Marks references with no matching Crossref record as unverified. (P4; `test/claims.test.ts`)
- Runs on your machine and sends only the reference details it looks up to Crossref. (P5; `test/network.test.ts`)
- Every finding links to its evidence and states limits L1–L3 (`test/claims.test.ts`, "every finding links to its evidence and states limits L1-L3").

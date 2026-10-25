# Changelog

## 0.1.0 (2026-10-25)

First version. Each claim below is in the [claim register](docs/claim-register.md) and backed by the named test.

Checks:

- Reads .bib files, LaTeX thebibliography lists and Markdown reference sections. (P7; `test/parsers.test.ts`)
- Flags references whose DOI does not resolve in Crossref. (P1; `test/claims.test.ts`)
- Flags retractions, corrections and expressions of concern recorded in Crossref, including Retraction Watch data. (P2; `test/claims.test.ts`)
- Shows where an entry's title, year or first author differs from the Crossref record. (P3; `test/claims.test.ts`)
- Marks references with no matching Crossref record as unverified. (P4; `test/claims.test.ts`)
- Every finding links to its evidence and states limits L1–L3 (`test/claims.test.ts`, "every finding links to its evidence and states limits L1-L3").

What leaves your machine:

- Runs on your machine and sends only the reference details it looks up to Crossref. (P5; `test/network.test.ts`)
- Makes no AI model calls: every check is a lookup in Crossref's records. (P9; `test/network.test.ts`)
- A Pro licence check sends your licence key, and no reference data, to Polar, the payment provider. (P10; `test/pro.test.ts`)

Free and Pro:

- Single-file checks are free; Pro is a one-time licence. (P6; `test/pro.test.ts`) Pro costs USD $12 on the [Polar product page](https://buy.polar.sh/polar_cl_sTahdpEXRlwOfOi2HwXgYerl2LRAoQTpoGNr909TkK1).
- Pro adds workspace-wide scans, CLI/CI exit codes, Markdown, CSV and JSON reports, and closest-match suggestions. (P8; `test/pro.test.ts`, `test/report.test.ts`)

Limits:

- Does not check DOIs registered outside Crossref, for example DataCite. (L1)
- Crossref's retraction data can miss some retractions. (L2)
- 'Unverified' means no matching record was found, not that the reference is fabricated. (L3)

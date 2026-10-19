# Claim register

These are the only claims Cite Ledger's README, product page, Marketplace and Open VSX listings, articles and replies may make about the product. A claim may be used only while its tests pass on the released version. The machine-readable copy is [`claim-register.json`](claim-register.json); `npm run check:claims` fails the build if a public surface uses a claim that is not accepted, or words it differently.

## Accepted

| ID | Claim | Evidence |
| --- | --- | --- |
| <a id="p1"></a>P1 | Flags references whose DOI does not resolve in Crossref. | Test: `P1: flags a reference whose DOI does not resolve in Crossref (unregistered-DOI fixture)` |
| <a id="p2"></a>P2 | Flags retractions, corrections and expressions of concern recorded in Crossref, including Retraction Watch data. | Tests: `P2: flags a retraction and a correction recorded by Retraction Watch (known retracted DOI fixture)`, `P2: flags an expression of concern recorded in Crossref`. Source: [Crossref, 2025-01-29](https://www.crossref.org/blog/retraction-watch-retractions-now-in-the-crossref-api/) |
| <a id="p3"></a>P3 | Shows where an entry's title, year or first author differs from the Crossref record. | Test: `P3: shows where the title, year and first author differ from the Crossref record (mismatch fixture)` |
| <a id="p4"></a>P4 | Marks references with no matching Crossref record as unverified. Pro: Marks references with no matching Crossref record as unverified and shows the closest match. | Tests: `P4: marks a reference with no matching Crossref record as unverified (free, no closest match)`, `P4 Pro: shows the closest match for an unverified reference`, `P4: a reference without a DOI that search confirms is not marked unverified` |
| <a id="p5"></a>P5 | Runs on your machine and sends only the reference details it looks up to Crossref. | Tests: `P5: checking every fixture file calls only api.crossref.org and sends no prose`, `P5: a free CLI run calls only api.crossref.org and never contacts the licence server`. See also [what leaves your machine](limits.md#what-leaves-your-machine). |
| <a id="p6"></a>P6 | Single-file checks are free; Pro is a one-time licence. | Test: `single-file checks, including retraction flags, are free and exit 0`. Usable only once the Pro product is live; the price is quoted from the live product page. |
| <a id="l1"></a>L1 | Does not check DOIs registered outside Crossref, for example DataCite. | [Limits](limits.md#l1) |
| <a id="l2"></a>L2 | Crossref's retraction data can miss some retractions. | [Limits](limits.md#l2) |
| <a id="l3"></a>L3 | 'Unverified' means no matching record was found, not that the reference is fabricated. | [Limits](limits.md#l3) |
| <a id="p7"></a>P7 | Reads .bib files, LaTeX thebibliography lists and Markdown reference sections. | Tests: `reads entries, fields, DOIs and lines from the fixture`, `reads thebibliography items, \doi and ignores comments`, `reads the References section, inline DOIs in prose, and skips code fences` |
| <a id="p8"></a>P8 | Pro adds workspace-wide scans, CLI/CI exit codes, Markdown, CSV and JSON reports, and closest-match suggestions. | Tests: `unlocks workspace scan, exit codes, export and closest match`, `Markdown, CSV and JSON reports carry evidence links and limits L1-L3` |
| <a id="p9"></a>P9 | Makes no AI model calls: every check is a lookup in Crossref's records. | Test: `P5: checking every fixture file calls only api.crossref.org and sends no prose` |
| <a id="p10"></a>P10 | A Pro licence check sends your licence key, and no reference data, to Polar, the payment provider. | Test: `licence validation sends only the key and public identifiers, with no secret` |

P1–P6 and L1–L3 were accepted on 2026-10-19 with the marketing standing instruction. P7–P10 were accepted on 2026-10-19 after the first build.

## Proposed, not yet usable

None at present. A new claim is added here first, with its test, and may not appear on any public surface until it is accepted.

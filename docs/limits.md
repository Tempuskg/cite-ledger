# What Cite Ledger cannot check

Every finding Cite Ledger reports carries these three limits, and a statement of how that particular finding could be wrong.

## L1

**Does not check DOIs registered outside Crossref, for example DataCite.**

Cite Ledger looks DOIs up only in Crossref. Datasets, software and some preprints often have DataCite DOIs; Zenodo DOIs are an example. For one of those, Cite Ledger reports that the DOI "does not resolve in Crossref". That finding also links to `doi.org`, so you can see whether the DOI resolves elsewhere.

## L2

**Crossref's retraction data can miss some retractions.**

Retraction, correction and expression-of-concern flags come from the update records in Crossref's metadata. Those records come from publishers and, since 2025, from Retraction Watch ([Crossref, 2025-01-29](https://www.crossref.org/blog/retraction-watch-retractions-now-in-the-crossref-api/)). A retraction that neither source has recorded in Crossref is not flagged. No flag does not mean a work stands unchallenged.

## L3

**'Unverified' means no matching record was found, not that the reference is fabricated.**

A reference without a DOI is searched for in Crossref, and it is marked unverified when no record matches its title, year and first author closely enough. Many real works have no Crossref record, including books, reports, theses, standards and web pages. An unverified reference needs a human check; it is not evidence of fabrication.

## What leaves your machine

- **Checks.** Cite Ledger sends each reference's DOI, or for a reference without a DOI its bibliographic text, to `api.crossref.org`. It sends nothing else from the file. If you set `citeLedger.mailto` (or `--mailto` / `CITE_LEDGER_MAILTO` for the CLI), that address is sent too, as Crossref asks for its [polite pool](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/). It is never put in a report or an evidence link. The test `P5: checking every fixture file calls only api.crossref.org and sends no prose` checks this.
- **Pro licence.** When you enter a Pro licence key, Cite Ledger sends that key, with public product identifiers, to Polar (`api.polar.sh`), the payment provider, to confirm it is valid. No reference data is sent. Without a key, Polar is never contacted. The test `licence validation sends only the key and public identifiers, with no secret` checks this.

## Reporting a wrong finding

If Cite Ledger reports something that is not true about a reference, please [open a wrong-finding issue](https://github.com/Tempuskg/cite-ledger/issues/new?template=wrong-finding.yml). Include the DOI or reference text, the finding and why you believe it is wrong. A wrong finding is treated as a defect.

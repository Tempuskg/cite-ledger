# Test fixtures

`crossref/` holds Crossref REST API responses recorded on 2026-10-19 from `api.crossref.org`, trimmed to the fields Cite Ledger reads. `files/` holds the reference files the tests check.

| Fixture | Source request | Used for |
| --- | --- | --- |
| `work-10.1016_s0140-6736(97)11096-0.json` | `GET /works/10.1016/S0140-6736(97)11096-0` | P2: a known retracted DOI. Crossref records a retraction (2010) and a correction (2004) from Retraction Watch. |
| `work-10.1371_journal.pone.0061107.json` | `GET /works/10.1371/journal.pone.0061107` | P2: an expression of concern, recorded by both Retraction Watch and the publisher. |
| `work-10.1038_nature14539.json` | `GET /works/10.1038/nature14539` | P3: the mismatch fixture compares a wrong title, year and first author against this record. |
| *(none: 404)* | `GET /works/10.5555/cite-ledger-unregistered-0000` | P1: an unregistered DOI. Crossref answers 404 "Resource not found." |
| `search-deep-learning.json` | `GET /works?query.bibliographic=LeCun Bengio Hinton Deep learning Nature 2015&rows=3` | P4: a reference without a DOI that search confirms. |
| `search-no-match.json` | `GET /works?query.bibliographic=Zzyzxqar Quantum entanglement kinetics of sourdough starter colonies under lunar gravity 2023&rows=3` | P4: a reference with no matching record (unverified), and the Pro closest match. |

The weekly live test (`npm run test:live`, workflow `crossref-live.yml`) repeats these requests against the real API, so a change in Crossref's data or format shows up as a failing run.

The retracted and corrected works are used only as test data. Cite Ledger's findings name the notice, never the authors' conduct.

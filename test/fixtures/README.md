# Test fixtures

`crossref/` holds Crossref REST API responses recorded on 2026-10-19 from `api.crossref.org`, trimmed to the fields Cite Ledger reads. The `agency-*` responses were recorded on 2026-10-26 and are untrimmed. `files/agency.bib` holds the two DataCite DOIs. `files/` holds the reference files the tests check. `parsers/table.md` is a parser-only fixture, kept out of `files/` so the workspace scans do not pick it up: a reference section that mixes list items with a Markdown table of DOIs. Its `10.5555/cite-ledger-*` DOIs are made up and its authors are placeholders. `arxiv/` holds a `.bib`, a `.tex` and a Markdown file of entries with no DOI that are arXiv preprints (`eprint` with `archivePrefix` or `eprinttype` arXiv, or `arXiv:NNNN.NNNNN` in the text), one that mentions arXiv only in passing, and one whose search matches the `search-deep-learning.json` record. It is also kept out of `files/`. It adds no recorded response: its searches are answered by `search-no-match.json` and `search-deep-learning.json`, and the `arXiv:1412.0000` identifier on the LeCun entries is made up. `linked/` holds two `.tex` files that name `.bib` files: `paper.tex` uses `\bibliography{main, refs/extra,missing}` (`missing.bib` does not exist), and `biblatex.tex` uses `\addbibresource` with the extension, a subfolder and a remote URL. Both have a commented-out command that must be ignored. `main.bib` and `refs/extra.bib` hold one placeholder entry each, with made-up authors, so a scan of the folder reaches each `.bib` file both directly and through the `.tex` files. It adds no recorded response: the made-up `10.5555/cite-ledger-unregistered-0000` DOI answers 404, and the search is answered by `search-no-match.json`.

| Fixture | Source request | Used for |
| --- | --- | --- |
| `work-10.1016_s0140-6736(97)11096-0.json` | `GET /works/10.1016/S0140-6736(97)11096-0` | P2: a known retracted DOI. Crossref records a retraction (2010) and a correction (2004) from Retraction Watch. |
| `work-10.1371_journal.pone.0061107.json` | `GET /works/10.1371/journal.pone.0061107` | P2: an expression of concern, recorded by both Retraction Watch and the publisher. |
| `work-10.1038_nature14539.json` | `GET /works/10.1038/nature14539` | P3: the mismatch fixture compares a wrong title, year and first author against this record. |
| *(none: 404)* | `GET /works/10.5555/cite-ledger-unregistered-0000` | P1: an unregistered DOI. Crossref answers 404 "Resource not found." |
| *(none: 404)* | `GET /works/10.5555/cite-ledger-unregistered-0000/agency` | P1: the agency lookup for the unregistered DOI also answers 404 "Resource not found.", so the P1 warning stays. |
| *(none: 404)* | `GET /works/10.48550/arxiv.1412.6980`, `GET /works/10.5281/zenodo.591564` | L1: DOIs with no Crossref record. |
| `agency-10.48550_arxiv.1412.6980.json` | `GET /works/10.48550/arxiv.1412.6980/agency` | L1: an arXiv DOI. Crossref names DataCite as its agency, so it gets an info finding, not P1's warning. |
| `agency-10.5281_zenodo.591564.json` | `GET /works/10.5281/zenodo.591564/agency` | L1: a Zenodo DOI, also registered with DataCite. |
| `search-deep-learning.json` | `GET /works?query.bibliographic=LeCun Bengio Hinton Deep learning Nature 2015&rows=3` | P4: a reference without a DOI that search confirms. |
| `search-no-match.json` | `GET /works?query.bibliographic=Zzyzxqar Quantum entanglement kinetics of sourdough starter colonies under lunar gravity 2023&rows=3` | P4: a reference with no matching record (unverified), and the Pro closest match. |

The weekly live test (`npm run test:live`, workflow `crossref-live.yml`) repeats these requests against the real API, so a change in Crossref's data or format shows up as a failing run.

The retracted and corrected works are used only as test data. Cite Ledger's findings name the notice, never the authors' conduct.

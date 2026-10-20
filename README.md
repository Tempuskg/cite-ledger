# Cite Ledger

Cite Ledger is an extension for VS Code-compatible editors, with a command-line tool, for checking reference lists against [Crossref](https://www.crossref.org/).

> **Pre-release.** Cite Ledger is not yet published to the VS Code Marketplace or Open VSX. This repository is where it is being built and tested.

## What it checks

- Reads .bib files, LaTeX thebibliography lists and Markdown reference sections. <sup>[P7](docs/claim-register.md#p7)</sup>
- Flags references whose DOI does not resolve in Crossref. <sup>[P1](docs/claim-register.md#p1)</sup>
- Flags retractions, corrections and expressions of concern recorded in Crossref, including Retraction Watch data. <sup>[P2](docs/claim-register.md#p2)</sup>
- Shows where an entry's title, year or first author differs from the Crossref record. <sup>[P3](docs/claim-register.md#p3)</sup>
- Marks references with no matching Crossref record as unverified. <sup>[P4](docs/claim-register.md#p4)</sup>

Every finding links to its evidence, such as the Crossref record or the retraction notice, and says how it could be wrong.

## Free and Pro

- Single-file checks are free; Pro is a one-time licence. <sup>[P6](docs/claim-register.md#p6)</sup>
- Pro adds workspace-wide scans, CLI/CI exit codes, Markdown, CSV and JSON reports, and closest-match suggestions. <sup>[P8](docs/claim-register.md#p8)</sup>

Pro costs USD $12, as listed on the [Polar product page](https://buy.polar.sh/polar_cl_sTahdpEXRlwOfOi2HwXgYerl2LRAoQTpoGNr909TkK1) ("This is a one-time charge").

## What leaves your machine

- Runs on your machine and sends only the reference details it looks up to Crossref. <sup>[P5](docs/claim-register.md#p5)</sup>
- Makes no AI model calls: every check is a lookup in Crossref's records. <sup>[P9](docs/claim-register.md#p9)</sup>
- A Pro licence check sends your licence key, and no reference data, to Polar, the payment provider. <sup>[P10](docs/claim-register.md#p10)</sup>

## What it cannot check

- Does not check DOIs registered outside Crossref, for example DataCite. <sup>[L1](docs/claim-register.md#l1)</sup>
- Crossref's retraction data can miss some retractions. <sup>[L2](docs/claim-register.md#l2)</sup>
- 'Unverified' means no matching record was found, not that the reference is fabricated. <sup>[L3](docs/claim-register.md#l3)</sup>

Details, and exactly what leaves your machine: [docs/limits.md](docs/limits.md).

## Using it in the editor

1. Open a `.bib`, `.tex` or Markdown file.
2. Run **Cite Ledger: Check References in This File** from the Command Palette, or use the checklist button in the editor title bar.
3. Findings appear in the Problems panel. Each one names its claim (P1–P4) and links to its evidence.

Settings:

- `citeLedger.mailto`: your email address for Crossref's polite pool. It is sent to Crossref with each lookup, as Crossref asks, and nowhere else.
- `citeLedger.checkOnSave`: check a reference file each time you save it. Off by default.

In a `.tex` file, Cite Ledger reads `thebibliography` lists. When the file uses `\bibliography{...}` or `\addbibresource{...}`, open the `.bib` file and check it there. In Markdown, it reads the section under a heading such as "References", "Bibliography" or "Works cited". A DOI elsewhere in the text is checked for retractions and whether it resolves, but not compared with the surrounding prose.

## Using the command line

```sh
node dist/cli.js check refs.bib --mailto you@example.org
node dist/cli.js limits
```

Run `node dist/cli.js --help` for every option and the exit codes.

## Reporting a wrong finding

A wrong finding is a defect. Please [open a wrong-finding issue](https://github.com/Tempuskg/cite-ledger/issues/new?template=wrong-finding.yml) with the reference, the finding, and why you believe it is wrong.

## Building and testing

```sh
npm ci
npm run check        # lint, tests, claim check, package
npm run test:live    # the claim fixtures against the real Crossref API
```

The tests use Crossref responses recorded on 2026-10-19; see [test/fixtures/README.md](test/fixtures/README.md).

## Licence

[MIT](LICENSE).

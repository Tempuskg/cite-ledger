---
id: card-mvq266pd-4
title: Prepare the 0.1.1 release
column: col-mvfa2glc-5
position: -10000
assignee: { kind: ai }
createdAt: 1793067630961
updatedAt: 1793099720217
dependsOn: [card-mvq266pd-1]
---

## Description
Get 0.1.1 ready, short of publishing it. It ships the DataCite change (`card-mvq266pd-1`). It also ships `card-mvq266pd-2` if that card is Done by then.

Steps:
1. Set `package.json` and `package-lock.json` to 0.1.1.
2. Turn the Unreleased section of `CHANGELOG.md` into a dated 0.1.1 section. Name each change and the test behind it, as 0.1.0 does.
3. Check that the README, `docs/limits.md` and the product page match the new behaviour, using only accepted claims.
4. Run `npm run check` and `npm run test:live`, and package the VSIX.
5. Install the VSIX in a clean editor profile, and check a file that holds a DataCite DOI.

Do not tag or publish. Pushing `v0.1.1`, which runs `release.yml`, is Darren's decision. Ask him in Activity. After a release he has approved, the T2 changelog entry follows under the standing instruction, logged in `docs/publication-log.md`.

## Acceptance criteria
- [x] `package.json` and `package-lock.json` are at 0.1.1. `CHANGELOG.md` has a dated 0.1.1 section that names each change and its test.
- [x] `npm run check` and `npm run test:live` pass on the release commit.
- [x] The README, product page and listing use only accepted claims. The listing text is unchanged, unless Darren approved a change.
- [x] The packaged VSIX was installed in a clean profile and run on a file with a DataCite DOI. The result is recorded in Activity.
- [x] Darren was asked in Activity for approval to push `v0.1.1`. No tag is pushed without it.

## Activity
### 2026-10-27T03:10:51.855Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-27T03:10:52.107Z - AI loop advanced this card
Moved to "In Progress".

### 2026-10-27T03:58:03.920Z - Handed off to Claude Code
Dispatched this card to Claude Code. The agent should append its completion note below.

### 2026-10-26 - Claude Code: 0.1.1 prepared, not tagged or published
- **What ships.** `card-mvq266pd-1` (DataCite agency lookup) and `card-mvq2il44-1` (arXiv-preprint message) are both Done. `card-mvq266pd-2` (`.tex` → `.bib`) is still in Ready, so it does not ship.
- **Commits, local only, not pushed:**
  - `40dac65`: the work of the two Done cards, which had not been committed yet.
  - `289a101`: the release commit. `package.json` and `package-lock.json` are at 0.1.1 (`npm version 0.1.1 --no-git-tag-version`, so no tag was created). `CHANGELOG.md` has a dated "0.1.1 (2026-10-26)" section that names each change with its claim, limit and tests (`test/claims.test.ts` suites "DOIs registered outside Crossref (L1)" and "arXiv preprints without a DOI (L1)", `test/summary.test.ts`, `test/report.test.ts`, `test/network.test.ts`, `test/parsers.test.ts`, `test-live/crossref-live.test.ts`). It also records the L1 paragraph change in `docs/limits.md`.
- **Public text.** README, `site/` and the listing are unchanged. The P1 line ("Flags references whose DOI does not resolve in Crossref") and the L1 line are still true: a DataCite DOI is still flagged under P1, now as info. `docs/limits.md` L1 already holds Darren's approved paragraph. README line 49 (open the `.bib` file) is still correct, because the `.tex` → `.bib` change does not ship. The `package.json` `displayName`, `description` and `keywords` are not in either commit's diff. `npm run check:claims`: "13 register entries; README, listing text and site use accepted claims only". The site changelog (T2) entry is left until after an approved release, as the card says.
- **Checks on the release commit.** In a fresh `git clone` checked out at `289a101` with `npm ci`:
  - `npm run check` exited 0: lint, 58 of 58 tests, claim check, `cite-ledger-0.1.1.vsix` packaged (9 files, 33.45 KB).
  - `npm run test:live` exited 0 (1 of 1 against api.crossref.org).
  - Tooling note: the same clone under `AppData\Local\Temp` failed only at `vsce package` ("Extension entrypoint(s) missing"; `vsce ls` listed no files at all). A clone on `E:\` passed. This is the location, not the commit.
- **Clean-profile install.** The VSIX built from that clone was installed with `code --user-data-dir <new dir> --extensions-dir <new dir> --install-extension cite-ledger-0.1.1.vsix` (VS Code 1.143.1). `--list-extensions --show-versions` gives `darrenjmcleod.cite-ledger@0.1.1`. The installed package's CLI (`dist/cli.js`) reports version `0.1.1`. With no licence key, it ran `check agency.bib` (a copy of `test/fixtures/files/agency.bib`) against live Crossref and exited 0: "Checked 2 references in 1 file(s) against Crossref: 2 finding(s)."
  - `kingma2014` (`10.48550/arxiv.1412.6980`) and `zenodo2017` (`10.5281/zenodo.591564`) each got `[P1 other-agency]` "… is registered with DataCite, not Crossref. Cite Ledger does not check DOIs registered outside Crossref (L1)." Evidence: the `/works/{doi}/agency` lookup and the doi.org link. Each has a "could be wrong" line, and the L1–L3 line is printed. No "does not resolve" warning.
  - Not done: the run inside the editor UI (Problems panel), because this agent cannot drive the editor. Same limit as in the 0.1.0 card. Darren may want to repeat it in the editor before tagging: run **Check References in This File** on a `.bib` file with `doi = {10.5281/zenodo.591564}`, and expect one Information diagnostic.
- **Cleanup left for Darren.** The removal was blocked by a safety check. Please delete the temporary clone `E:\cite-ledger-rel-0.1.1` (it holds the test profile under `.profile-test`) and the logs `E:\cl011-check.log` and `E:\cl011-live.log`. Rebuild the VSIX from `289a101` with `npm run vsix` if you need it again.
- **Darren: do you approve pushing `v0.1.1`?** On a yes: push `main` (`40dac65`, `289a101`), then tag `289a101` as `v0.1.1` and push the tag. That runs `release.yml`, which publishes to the VS Code Marketplace and Open VSX. After that, the T2 changelog entry goes on the product page under the standing instruction and is logged in `docs/publication-log.md`. No tag has been created or pushed. `git tag -l` shows only `v0.1.0`, and `main` is 2 commits ahead of `origin/main`.

STATUS: DONE

### 2026-10-26 - Release v0.1.1, approved by Darren
- Darren approved pushing `v0.1.1` in chat on 2026-10-26 ("Yes"). Source: reported by Darren McLeod.
- Pushed `main` (`d225f83..289a101`). Created the annotated tag `v0.1.1` on `289a101` and pushed it.
- CI on `main`: success (run 40447675668). Release (run 40447678305): success. The log shows "Published darrenjmcleod.cite-ledger v0.1.1." for the VS Code Marketplace and "Published darrenjmcleod.cite-ledger v0.1.1" for Open VSX. The GitHub release https://github.com/Tempuskg/cite-ledger/releases/tag/v0.1.1 has `cite-ledger-0.1.1.vsix` and `cite-ledger-cli-v0.1.1.js`.
- Not done yet: the T2 changelog entry on the product page under the standing instruction, and its line in `docs/publication-log.md`.

---
id: card-mvfa2glc-5
title: Prepare the 0.1.0 release
column: col-mvfa2glc-5
position: -3000
assignee: { kind: human }
createdAt: 1792415841150
updatedAt: 1792634612130
dependsOn: [card-mvfa2glc-1, card-mvfa2glc-3]
---

## Description
Get the first release ready, short of publishing it. It needs the Polar product and benefit id (`card-mvfa2glc-1`) and Darren's claim review (`card-mvfa2glc-3`).

Steps:
1. Set `POLAR_BENEFIT_ID`.
2. Record the P6 product URL.
3. Add the P6 line, with the price quoted from the live Polar page, to the README and the product page.
4. Add any newly accepted claims, word for word.
5. Finalise `CHANGELOG.md`.
6. Make sure `package.json` is at 0.1.0.
7. Install the packaged VSIX in a clean editor profile, and check one free file and one Pro workspace scan with a real key.

Do not tag or publish. That is the launch, `card-mvfa2glc-6`.

## Acceptance criteria
- [x] `npm run check` and `npm run test:live` pass on the release commit.
- [x] The README, product page and listing use only accepted claims, and P6 carries the live Polar price.
- [x] A packaged VSIX was installed and run once free and once with a Pro key. The results are recorded in Activity, without the key.

## Activity
### 2026-10-20T04:08:53.970Z - AI loop advanced this card
Moved to "Ready".

### 2026-10-20T04:11:50.422Z - AI loop advanced this card
Moved to "In Progress".

### 2026-10-20T04:11:50.492Z - Anthropic Claude Code CLI implementation handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-19 - Claude Code implementation
- Steps 1 and 2 were already done in `50fe6b4`: `POLAR_BENEFIT_ID` is `6474b7e4-7fae-4610-92f6-08d1ba2a4398` in `src/core/license.ts`, and P6 `productUrl` is set in `docs/claim-register.json`.
- Step 3: fetched the live Polar page (P6 `productUrl`, which redirects to a Polar checkout). It shows "Cite Ledger Pro", "$12", "This is a one-time charge". Its data has `price_currency: usd`, `price_amount: 1200`, `type: one_time`, organization `9a3f3f03-…d634a` and benefit `6474b7e4-…4398`. Added a "Free and Pro" section to `README.md` and `site/index.html`. It has P6 and P8 word for word, then "Pro costs USD $12, as listed on the Polar product page", linking to that page. Removed "and nothing is on sale" from the README pre-release note, because it now contradicted the price line. The rest of the note is unchanged.
- Step 4: P8 added to the README. P7, P8, P9 and P10 added to the product page. All are word for word and tagged. The listing (`package.json` displayName, description, keywords) is unchanged, as Darren approved on `card-mvfa2glc-3`.
- Step 5: `CHANGELOG.md` is now "0.1.0 (not yet released)" and lists P1–P10 with their test files, plus L1–L3. The launch card adds the date.
- Step 6: `package.json` is at 0.1.0. The CLI reports "Cite Ledger 0.1.0".
- Committed as `7928ae2` ("Prepare the 0.1.0 release text"), locally only. It is not pushed, tagged or published. Only README, site and CHANGELOG are in that commit.
- Criterion 1: in a clean worktree at `7928ae2` (after `npm ci`), `npm run check` exited 0 (lint, 37 of 37 tests, claim check with 13 entries, vsix packaged). `npm run test:live` exited 0 (1 of 1 against the real Crossref API).
- Criterion 2: `npm run check:claims` passes, and P6 carries the live price (USD $12, one-time).
- Criterion 3, partly done:
  - The packaged `cite-ledger-0.1.0.vsix` built from `7928ae2` installed into a clean profile (`code --user-data-dir <tmp> --extensions-dir <tmp>`), and `--list-extensions` shows `darrenjmcleod.cite-ledger@0.1.0`.
  - Free run: the installed package's CLI ran `check test/fixtures/files/claims.bib` without a key and exited 0. It checked 7 references and found 8 findings (P1, P2 ×3, P3 ×3, P4), each with evidence links and a "could be wrong" line.
  - The same CLI, run on the whole folder without a key, refused the scan: "Checking more than one file at a time (workspace scan) needs a Cite Ledger Pro licence."
  - Not done: the in-editor run from the clean profile, because this agent cannot drive the editor UI. The Pro workspace scan with a real key is also not done: no key is available to the agent, and none should be.
- Note for Darren: the uncommitted work for `card-mvg4vtxy-2` (`src/extension.ts`, `src/core/summary.ts`, `test/summary.test.ts`, which is in Verify) is not in `7928ae2`. If it should ship in 0.1.0, commit it after your check, then run `npm run check` and `npm run test:live` again and rebuild the VSIX before the Pro test.
- To finish criterion 3:
  1. Run `npm run vsix`.
  2. Run `code --user-data-dir <empty dir> --extensions-dir <empty dir> --install-extension cite-ledger-0.1.0.vsix`, then open that profile.
  3. Run **Check References in This File** on one file.
  4. Enter your Pro key and run the workspace scan, or run `node dist/cli.js check <folder>` with the key in `CITE_LEDGER_LICENSE_KEY`.
  5. Record both results here, without the key.

Initially reported as blocked: Pro workspace scan needs Darren's real Pro key and an in-editor run of the installed VSIX; see the last Activity entry for the steps. Resolved in the 2026-10-22 interview.

### 2026-10-21T15:46:18.933Z - Anthropic Claude Code CLI implementation handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-21 - Claude Code re-check
- Nothing has changed since the last entry. `HEAD` is still `7928ae2`. No Pro key is available to the agent: `CITE_LEDGER_LICENSE_KEY` is unset, and the agent should not go looking for one. No one has recorded a free or Pro run of the installed VSIX in the editor.
- Criteria 1 and 2 are still met at `7928ae2`. Criterion 3 is still unchecked.
- Since the last entry, more uncommitted work is in the tree: `src/core/markdown.ts`, `src/core/types.ts`, `test/parsers.test.ts`, `test/fixtures/parsers/` (`card-mvg4vtxy-1`), on top of the `card-mvg4vtxy-2` files. If any of it should ship in 0.1.0, commit it first. Then run `npm run check` and `npm run test:live` again, and rebuild the VSIX before the Pro test. Otherwise `cite-ledger-0.1.0.vsix` in the working tree may not match `7928ae2`. Rebuild it from a clean checkout of the release commit.
- To finish this card, Darren follows the five steps in the previous entry and records both results here, without the key.

Initially reported as blocked: the Pro workspace scan needs Darren's real Pro key, and the in-editor run of the installed VSIX needs a human; the steps are in the 2026-10-19 Activity entry. Resolved in the 2026-10-22 interview.

### 2026-10-22T01:06:39.153Z - OpenAI Codex CLI implementation handoff started
Started OpenAI Codex CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: gpt-6-luna.
AI loop stage thinking level rule for the implementation stage: max.

### 2026-10-22T01:06:43.981Z - OpenAI Codex CLI implementation handoff failed
OpenAI Codex CLI ran out of credits or hit its usage limit: ERROR: You’ve hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/settings/usage to purchase more credits or try again at Oct 27th, 2026 8:30 AM.. The card was not advanced; restore the CLI's allowance or configure an AI loop CLI fallback, then rerun the loop.

### 2026-10-22T01:07:12.069Z - Anthropic Claude Code CLI implementation handoff started
Started Anthropic Claude Code CLI in the active workspace and waiting for card-file completion evidence.
AI loop stage model rule for the implementation stage: opus.
AI loop stage thinking level rule for the implementation stage: medium.

### 2026-10-22 - Claude Code re-check
- Still unchanged. `HEAD` is `7928ae2`, `CITE_LEDGER_LICENSE_KEY` is unset, and no one has recorded an in-editor free run or a Pro run. The uncommitted work for `card-mvg4vtxy-1` and `card-mvg4vtxy-2` is still in the tree and is not in the release commit.
- Criteria 1 and 2 are still met. Criterion 3 is still unchecked.
- This is the third handoff in a row with nothing an agent can do. Darren, please either do the five steps in the 2026-10-19 entry and record the results here, or move this card out of the AI loop until you can.

Initially reported as blocked: the Pro workspace scan needs Darren's real Pro key, and the in-editor run of the installed VSIX needs a human; the steps are in the 2026-10-19 Activity entry. Resolved in the 2026-10-22 interview.

### 2026-10-22T01:48:45.006Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-22 - Interview: state check (verified evidence)
- `git log` / `git status`: `HEAD` is still `7928ae2`. The `card-mvg4vtxy-1` files (`src/core/markdown.ts`, `src/core/types.ts`, `test/parsers.test.ts`, `test/fixtures/parsers/`, `test/fixtures/README.md`) and the `card-mvg4vtxy-2` files (`src/extension.ts`, `src/core/summary.ts`, `test/summary.test.ts`) are still uncommitted.
- `.mwnn/cards/card-mvg4vtxy-1.md` and `card-mvg4vtxy-2.md`: both are now in column Done (`col-mvfa2glc-5`) with `STATUS: DONE`.
- `cite-ledger-0.1.0.vsix` in the working tree is dated 2026-10-19 22:25.
- `CITE_LEDGER_LICENSE_KEY` is unset in the agent's shell. The agent did not look for a key.
- Open question for Darren: whether the Done `card-mvg4vtxy-1` and `card-mvg4vtxy-2` work ships in 0.1.0. That decides which VSIX the criterion 3 test must use.

### 2026-10-22 - Interview: answer (user-reported)
- Q: Should the `card-mvg4vtxy-1` and `card-mvg4vtxy-2` changes ship in 0.1.0?
- A: "yes". Reported by Darren in the interview chat, 2026-10-22.
- Consequence: the agent commits that work, runs `npm run check` and `npm run test:live` again, and rebuilds the VSIX. Criterion 1 must then hold on the new release commit.

### 2026-10-22 - Interview: new release commit and rebuilt VSIX (verified evidence)
- Committed locally, not pushed, tagged or published: `ef440a9` ("Read DOIs in Markdown tables in reference sections (card-mvg4vtxy-1)") and `7643337` ("Make the result of a file check easy to find (card-mvg4vtxy-2)"). The release commit is now `7643337`. `CHANGELOG.md` needed no change: the P7 line already covers Markdown reference sections, and the result message is UI, not a claim.
- Criterion 1 on `7643337`:
  - In the main tree (tracked files equal `7643337`), `npm run check` passed: lint, 44 of 44 tests, claim check with 13 entries, vsix packaged.
  - In a clean worktree at `7643337` after `npm ci`: lint, 44 of 44 tests and the claim check passed, and `npm run test:live` exited 0 (1 of 1 against the real Crossref API). There, `npm run vsix` failed with "Extension entrypoint(s) missing". Cause: in the agent's shell, `npm list` prints the worktree path with the session-id folder masked as `***`, so vsce's dependency scan resolves to a path that does not exist and includes no files. This is an artefact of the agent environment. The same step passes in the main tree.
  - `package.json` has no runtime `dependencies`. `vsce package --no-dependencies` in the clean worktree produced a package whose extension files (`dist/extension.js`, `dist/cli.js`, `package.json`, readme, changelog, licence, icon, manifest) are byte-identical to the main-tree `npm run vsix` build. The only extra files were two log files the agent had written into the worktree. The worktree was then removed.
- VSIX for the test: `E:\cite-ledger\cite-ledger-0.1.0.vsix`, SHA-256 `8b78575dcb401f6ddde455499584d5486239c4d1cbec1c431156f87c010023e6`, 9 files, 31.33 KB, built from `7643337`.
- Clean-profile install of that VSIX (`code --user-data-dir <empty> --extensions-dir <empty> --install-extension`): `--list-extensions --show-versions` shows `darrenjmcleod.cite-ledger@0.1.0`.
- Free run, using the installed package's `dist/cli.js` with no licence key in the environment:
  - `check test/fixtures/files/claims.bib` exited 0: "Checked 7 references in 1 file(s) against Crossref: 8 finding(s)." The findings were P1 doi-not-found, P2 correction, P2 retraction, P2 expression-of-concern, P3 title, year and first-author differs, and P4 unverified, each with evidence links and a "could be wrong" line, followed by the L1–L3 limits line.
  - `check test/fixtures/files` (workspace scan) exited 2: "Checking more than one file at a time (workspace scan) needs a Cite Ledger Pro licence. Single-file checks, including retraction flags, are free."
- Still needs Darren: the in-editor free run (**Check References in This File**) in the clean profile, and the Pro workspace scan with a real key.

### 2026-10-22 - Interview: in-editor free run (user-reported)
- Setup given by the agent: the clean profile above (empty `--user-data-dir` and `--extensions-dir`, with only the `7643337` VSIX installed), opened on `test/fixtures/files`, not signed in, no licence key entered.
- Q: What did **Cite Ledger: Check References in This File** on `claims.bib` show?
- A, as reported: "Cite Ledger: 8 findings in 7 references in claims.bib (1 correction, 1 retraction, 1 expression of concern, 1 DOI not found, 1 title differs, 1 year differs, 1 first author differs, 1 unverified)." Reported by Darren in the interview chat, 2026-10-22.
- Not reported: whether the message buttons led to the findings, and the Problems count. These are not needed for criterion 3.
- The reported counts match the agent's CLI free run of the same file on the same build (7 references, 8 findings, same kinds).

### 2026-10-22 - Interview: in-editor Pro workspace scan (user-reported)
- Setup: the same clean-profile window. Darren entered his real Pro key with **Cite Ledger: Enter Pro Licence Key**. The key was not shared with the agent and is not recorded.
- Q: What did **Cite Ledger: Check All Reference Files in Workspace (Pro)** report?
- A, as reported: "Cite Ledger: 15 findings in 14 references in 3 files (3 corrections, 3 retractions, 3 unverified, 2 DOIs not found, 1 expression of concern, 1 title differs, 1 year differs, 1 first author differs). References for this file are in extra.bib. Open extra.bib and check it there. References for this file are in refs.bib. Open it and check it there." Reported by Darren in the interview chat, 2026-10-22.
- So the key was accepted and the workspace scan ran, where without a key the scan had been refused (CLI run above).
- Agent check (verified evidence): `test/fixtures/files` holds `claims.bib`, `claims.md` and `claims.tex`, which are the 3 files. The two notes are expected: `src/core/latex.ts:56` writes "Open extra.bib and check it there" for the `.tex` bibliography, and `src/core/markdown.ts:170` writes "Open it and check it there" for the Markdown one. Neither `.bib` file is in the folder. The two parsers word the note differently, which is cosmetic and not a defect against any criterion.

### 2026-10-22 - Interview summary
- Criterion 1, met (verified evidence): `npm run check` and `npm run test:live` pass on the new release commit `7643337`. The clean-worktree packaging caveat and the byte-identical comparison are recorded above.
- Criterion 2, met (unchanged): no README, site or listing text changed since `7928ae2`, and the claim check passes on `7643337`.
- Criterion 3, met: the `7643337` VSIX (SHA-256 `8b78575d…23e6`) was installed in a clean profile (verified evidence). It was run once free in the editor (user-reported, matching the agent's CLI run) and once as a Pro workspace scan with Darren's real key (user-reported). The key is not recorded.
- No unresolved exceptions. Not done, by design: no push, tag or publish. That is `card-mvfa2glc-6`. `ef440a9` and `7643337` are local commits on `main` and have not been pushed. The card was not moved and its assignee was not changed.
- Earlier blocked reasons (Pro key and in-editor run needed a human) were resolved in this interview.

STATUS: DONE

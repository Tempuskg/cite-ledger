---
id: card-mvfa2glc-6
title: "Launch: approve the first public release to both registries (deadline 2026-12-31)"
column: col-mvfa2glc-5
position: -6000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792930800000
dependsOn: [card-mvfa2glc-2, card-mvfa2glc-4, card-mvfa2glc-5]
---

## Description
The launch is the first release to the VS Code Marketplace and Open VSX. It needs Darren's approval before it happens, and it must happen **by 2026-12-31**. If that date passes without a launch, all work stops and returns to Darren on company card `card-mvf572fm-1`.

Once Darren approves in writing, the agent pushes the tag `v0.1.0`. `release.yml` then:
1. reruns every check, including the live Crossref test;
2. creates the GitHub release with the VSIX and the CLI file;
3. publishes to both registries.

The agent then:
- posts the T2 changelog entry under the standing instruction;
- logs it in `docs/publication-log.md`;
- records the launch on `card-mvf572fm-1`.

The launch announcement on the product's own channels is a separate approval, as the report's setup steps list it.

## Acceptance criteria
- [x] Darren approved the release before the tag was pushed. His words and the date are recorded in Activity.
- [x] `release.yml` passed, and the extension is listed on both the VS Code Marketplace and Open VSX. Both URLs are recorded here.
- [x] The launch date is recorded on company card `card-mvf572fm-1`.

## Activity
### 2026-10-25 - Asked Darren: launch approval (Cursor Agent from company card-mvf572fm-1)
Dependencies Done: `card-mvfa2glc-2` (Open VSX confirmed), `-4` (product page live at https://tempuskg.github.io/cite-ledger/), `-5` (release prep at local `7643337`). Verified not launched: `main` ahead of `origin/main` by 3; no `v*` tags; Marketplace and Open VSX have no `darrenjmcleod.cite-ledger`. Secrets `VSCE_PAT`/`OVSX_PAT` present (names only). Question put in the company-card coworking chat.

### 2026-10-25 - Launch approved (user-reported)
Q: Do you approve the first public release of Cite Ledger `v0.1.0` to the VS Code Marketplace and Open VSX (push the pending commits, push tag `v0.1.0`, and let `release.yml` publish)?
A: "Yes". Reported by Darren McLeod in interview chat, 2026-10-25.
Criterion 1 met (approval before tag). Proceeding to push `main`, create and push `v0.1.0`.

### 2026-10-25 - Launch completed (verified evidence)
Under Darren's approval of 2026-10-25:
1. Pushed `main` `b5956fe..7643337` and annotated tag `v0.1.0`.
2. **Release** workflow run `40192727110` completed successfully (lint, 44 tests, check:claims, live Crossref, package, GitHub release, Marketplace, Open VSX).
3. GitHub release: https://github.com/Tempuskg/cite-ledger/releases/tag/v0.1.0
4. **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=darrenjmcleod.cite-ledger (v0.1.0; short description is claim P2 word for word).
5. **Open VSX:** https://open-vsx.org/extension/darrenjmcleod/cite-ledger (v0.1.0; search API and `/api/…/latest` confirm; published 2026-10-25T12:22:03Z).
6. T2 changelog posted under §8 on the product page (`site/index.html`) and `CHANGELOG.md` dated 2026-10-25; logged in `docs/publication-log.md`.
7. Launch date recorded on company card `card-mvf572fm-1`.

All criteria met; moved to Done. Assignee unchanged.

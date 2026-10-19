---
id: card-mvfa2glc-6
title: "Launch: approve the first public release to both registries (deadline 2026-12-31)"
column: col-mvfa2glc-1
position: 3000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792415841150
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
- [ ] Darren approved the release before the tag was pushed. His words and the date are recorded in Activity.
- [ ] `release.yml` passed, and the extension is listed on both the VS Code Marketplace and Open VSX. Both URLs are recorded here.
- [ ] The launch date is recorded on company card `card-mvf572fm-1`.

## Activity

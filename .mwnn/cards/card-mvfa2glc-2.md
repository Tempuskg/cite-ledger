---
id: card-mvfa2glc-2
title: Add the release secrets and confirm the Open VSX namespace
column: col-mvfa2glc-2
position: 2000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792415841150
---

## Description
`.github/workflows/release.yml` reuses the tag-triggered pattern from command-shelf. On 2026-10-19 Darren decided that GitHub Actions release secrets do not count as credentials stored in a repository or automation context. Each release still needs his approval.

Steps, all Darren's:
1. Add `VSCE_PAT` and `OVSX_PAT` as repository secrets on `Tempuskg/cite-ledger`. For example: `gh secret set VSCE_PAT -R Tempuskg/cite-ledger`. No agent sees these values.
2. Confirm that the `darrenjmcleod` namespace on Open VSX is still yours and that its Publisher Agreement is current.

## Acceptance criteria
- [ ] `gh secret list -R Tempuskg/cite-ledger` shows `VSCE_PAT` and `OVSX_PAT`. The listing shows names only.
- [ ] Darren confirms the Open VSX namespace and Publisher Agreement are current. The confirmation is recorded in Activity with the date.

## Activity

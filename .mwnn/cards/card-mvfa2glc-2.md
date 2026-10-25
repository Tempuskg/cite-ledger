---
id: card-mvfa2glc-2
title: Add the release secrets and confirm the Open VSX namespace
column: col-mvfa2glc-5
position: -4000
assignee: { kind: human, name: Darren McLeod }
createdAt: 1792415841150
updatedAt: 1792929413092
---

## Description
`.github/workflows/release.yml` reuses the tag-triggered pattern from command-shelf. On 2026-10-19 Darren decided that GitHub Actions release secrets do not count as credentials stored in a repository or automation context. Each release still needs his approval.

Steps, all Darren's:
1. Add `VSCE_PAT` and `OVSX_PAT` as repository secrets on `Tempuskg/cite-ledger`. For example: `gh secret set VSCE_PAT -R Tempuskg/cite-ledger`. No agent sees these values.
2. Confirm that the `darrenjmcleod` namespace on Open VSX is still yours and that its Publisher Agreement is current.

## Acceptance criteria
- [x] `gh secret list -R Tempuskg/cite-ledger` shows `VSCE_PAT` and `OVSX_PAT`. The listing shows names only.
- [x] Darren confirms the Open VSX namespace and Publisher Agreement are current. The confirmation is recorded in Activity with the date.

## Activity
### 2026-10-22T02:03:53.233Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-21 - Secret listing checked (verified evidence)
Ran `gh secret list -R Tempuskg/cite-ledger` (exit 0). It listed no repository secrets: `VSCE_PAT` and `OVSX_PAT` are not set yet. `.github/workflows/release.yml` reads `secrets.VSCE_PAT` (line 60) and `secrets.OVSX_PAT` (line 70), so those are the names it needs. The first criterion is not met.

### 2026-10-22 - Secret listing rechecked (verified evidence, Claude Code from company card-mvf572fm-1)
Ran `gh secret list` on `Tempuskg/cite-ledger`. It lists `VSCE_PAT` (set 2026-10-22T02:08:45Z) and `OVSX_PAT` (set 2026-10-22T02:10:01Z), names only. Criterion 1 is met. Criterion 2 still needs Darren's confirmation of the `darrenjmcleod` Open VSX namespace and Publisher Agreement.

### 2026-10-24T23:48:18.000Z - Public namespace check (verified evidence, Cursor Agent from company card-mvf572fm-1)
`GET https://open-vsx.org/api/darrenjmcleod` returns `"verified": true` with the extensions `command-shelf`, `mwnn-kanban` and `session-control`. So the namespace exists and is verified. The public API does not show who owns it or whether the Publisher Agreement is current. Only Darren can confirm those, so criterion 2 stays unchecked. He was asked in chat on 2026-10-24 and skipped the question.

### 2026-10-25 - Public namespace recheck (verified evidence, Cursor Agent from company card-mvf572fm-1)
`GET https://open-vsx.org/api/darrenjmcleod` still returns `"verified": true` with `command-shelf`, `mwnn-kanban` and `session-control`. `gh secret list` still shows `VSCE_PAT` and `OVSX_PAT` (names only). Criterion 1 remains met. Criterion 2 still needs Darren. Asked again in the company-card coworking chat.

### 2026-10-25 - Open VSX namespace confirmed (user-reported)
Q: Do you confirm that the Open VSX namespace `darrenjmcleod` is still yours and that its Publisher Agreement is current?
A: "Yes". Reported by Darren McLeod in interview chat, 2026-10-25.
Criterion 2 is met. Both criteria are met; moved to Done. Assignee unchanged.

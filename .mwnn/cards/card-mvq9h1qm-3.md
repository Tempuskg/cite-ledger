---
id: card-mvq9h1qm-3
title: Delete the 0.1.1 release scratch files
column: col-mvfa2glc-5
position: -16000
assignee: { kind: human, name: Darren }
createdAt: 1793099500358
updatedAt: 1793460022922
---

## Description
The 0.1.1 release test (`card-mvq266pd-4`) left a temporary clone and two logs outside the repository. A safety check stopped the agent from deleting them. They hold nothing that is needed: the release was built in CI from tag `v0.1.1`.

- `E:\cite-ledger-rel-0.1.1` (a clone at `289a101`, with the test editor profile under `.profile-test`)
- `E:\cl011-check.log`
- `E:\cl011-live.log`

## Acceptance criteria
- [ ] All three are deleted.

## Activity
### 2026-10-31T14:26:52.633Z - AI-guided interview started in Claude Code
Opened an interview chat in Claude Code. Answers are recorded below as they are given; this entry is not evidence that any acceptance criterion is met.

### 2026-10-31 - Pre-deletion checks (verified evidence)
- All three targets exist: `E:\cite-ledger-rel-0.1.1` (directory), `E:\cl011-check.log` (7293 bytes), `E:\cl011-live.log` (345 bytes), all dated 2026-10-26 22:01 (`ls -la`).
- The clone is checked out detached at `289a101`. Its local `main` matches `origin/main` at `289a101`. It has no stashes and no unpushed commits. The only untracked path is `.profile-test/` (`git status`, `git stash list`, `git branch -a -vv`, `git log --branches --not --remotes`, run in the clone).
- In the main repository, tag `v0.1.1` resolves to `289a101aaf53b10309e82004b0a08fe5c731e572`, and that commit is in `main` (`git rev-parse v0.1.1^{commit}`, `git merge-base --is-ancestor 289a101 main`).
- The logs are output from the release check and the live Crossref test (`npm run check`, `test:live`: 1 pass, 0 fail). Nothing in them needs to be kept.
- Conclusion: the clone holds no work that exists only there. The deletion needs Darren's go-ahead because the files are outside the workspace and it cannot be undone.

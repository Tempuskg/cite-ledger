# Cite Ledger: instructions for AI agents

Cite Ledger checks the reference lists in `.bib`, `.tex` and Markdown files against the free Crossref REST API. It ships as an extension for VS Code-compatible editors (publisher `darrenjmcleod`, VS Code Marketplace and Open VSX) and a CLI. Darren McLeod is its owner and sole approver, with no backup. His review window is 06:00–21:00 America/Regina. Silence never grants authority.

This file governs this repository. `CLAUDE.md` points here.

## Hard rules

1. **Network.** A check contacts only `api.crossref.org`. A licence check contacts only `api.polar.sh`, and only after a user enters a key. Never add another host, telemetry, analytics, a model call or a runtime dependency that phones home. The P5 network tests enforce this.
2. **No secrets in the client or the repository.** Polar validation uses the public organization and benefit identifiers only. The release tokens `VSCE_PAT` and `OVSX_PAT` exist only as GitHub Actions secrets that Darren sets. Never read, print, copy or move them.
3. **Claims.**
   - Public surfaces (`README.md`, `package.json` listing fields, `site/`) use only *accepted* claims from [`docs/claim-register.json`](docs/claim-register.json), word for word, each tagged as the existing lines are. `npm run check:claims` enforces this.
   - A new claim, a change to listing text or a price change is Darren's decision.
4. **Findings.**
   - Every finding links to its evidence, carries limits L1–L3 and says how it could be wrong.
   - "Unverified" never means "fabricated".
   - Findings, docs and marketing never name or characterise the authors of retracted or questioned work.
5. **Free tier.** Single-file checks, including retraction flags, stay free.
6. **Cost.**
   - The project adds CAD $0/month of AI/automation cost.
   - A card run costs CAD $0 extra, including retries and provider fallback.
   - No paid API, purchase or subscription.
   - If a run would incur a charge, or an allowance is exhausted, stop and report.

## Required checks

All four must pass before anything is merged or pushed to `main`. `npm run check` runs them in order:

| Check | Command |
| --- | --- |
| Lint and types | `npm run lint` |
| Tests, including the P1–P5 claim tests | `npm test` |
| Claim register | `npm run check:claims` |
| Package | `npm run vsix` |

In GitHub these run as workflow **CI**, job **check** (`.github/workflows/ci.yml`), on every push to `main` and every pull request. `npm run test:live` runs the claim fixtures against the real Crossref API. It runs weekly as workflow **Crossref live** and before every release.

## What an agent may do on an approved card

- Make and test local changes, then commit and push to `main` once every required check passes.
- Once Cite Ledger has launched, publish only under the accepted marketing standing instruction and within it. That instruction is held privately (see below).
  - Channels: articles and changelog entries on the product page (`site/`), README edits within the claim register, and replies in this repository's GitHub Discussions to threads someone else opened.
  - Log every published item in [`docs/publication-log.md`](docs/publication-log.md).

## What needs Darren first

- **Releases.** Every release, including the launch: pushing a `v*` tag or running `release.yml`, which publishes to both registries.
- **The product page.** Enabling or deploying it the first time: the `PAGES_ENABLED` variable and the Pages settings.
- **Listing and pricing.**
  - Listing text: `displayName`, `description` and `keywords` in `package.json`.
  - The price, and the Polar product.
  - Any claim outside the accepted register.
- **Outbound communication.** Emails, direct messages, and any channel the standing instruction does not list (Hacker News, DEV, Reddit, social networks, other people's repositories or forums).
- **Money, terms and access.**
  - Spending, contracts and terms, refunds and payouts.
  - Destructive changes.
  - Repository settings, visibility and secrets.

## Private operating records

The operating runbook, the standing instruction and the operating record are kept in the company's private repository. The operating record covers revenue, costs and owner time.
- **Local checkout:** `e:/101245880sasktatchewanltd`.
- **Runbook:** `plans/cite-ledger-runbook.md`.
- **Standing instruction:** §8 of `plans/autonomous-profit-project-research-2026-10-19.md`. Its status is recorded on card `card-mvctur05-1`.

Rules:
- Read the runbook before any operations card.
- If you cannot read the standing instruction, if it has been revoked, or if it is past its expiry (2027-01-17 unless renewed), publish nothing.
- Never copy content from those private files into this public repository. The only exception is the public details of published items, in the publication log.

## Board and privacy

`.mwnn/` is this project's MWNN Kanban board and it is public. See [`.mwnn/README.md`](.mwnn/README.md).
- Never put revenue, prices other than the public one, customer or licence-holder details, or other personal data on it. The same applies to issues and commits.
- An escalation that involves money, refunds, licences, legal matters, privacy or personal data goes to the company board in the private repository, as a card that contains no personal data.
- Other escalations go on this board. Those include a wrong-finding report, a failing claim test and a platform warning.

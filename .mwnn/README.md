# MWNN Kanban board files

This folder is the source of truth for Cite Ledger's MWNN Kanban board. **It is public**, like the rest of this repository.

## Files

- `columns.json` stores the ordered column layout, roles, and WIP or reverse-WIP limits.
- `cards/<card-id>.md` stores one card per Markdown file. Its frontmatter holds the column, position, assignee, dependencies (`dependsOn`) and timestamps.
- `README.md` documents the contract for humans and AI agents editing the board directly.

## Card workflow

1. Find work in `cards/*.md`.
2. Claim work and report progress in the card's `## Activity` section.
3. Update the `## Description` and `## Acceptance criteria` sections as the slice becomes better defined or completes.
4. Move a card by editing its `column` and `position` frontmatter values.
5. Respect column `wipLimit` values and the Ready column's `reverseWip` minimum from `columns.json`.
6. A card with `dependsOn` stays blocked until every listed card reaches Done.

## What never goes on this board

The board is public, so none of the following goes on it:
- revenue or costs;
- customer or licence-holder details;
- licence keys;
- personal data;
- anything from the company's private operating records.

Those go to the company board in the private repository, as [AGENTS.md](../AGENTS.md) describes.

## Dates

- **Launch deadline: 2026-12-31.** The first public release to both registries must happen by then, with Darren's approval. If it has not, work stops and returns to him.

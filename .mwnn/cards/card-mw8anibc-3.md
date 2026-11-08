---
id: card-mw8anibc-3
title: Word the could-be-wrong note to fit each Crossref notice type
column: col-mvfa2glc-1
position: 3000
createdAt: 1794170267256
updatedAt: 1794170267256
---

## Description
Raised by the weekly operations run on `card-mw72euz3-2` (2026-11-08). Every P2 finding (retraction, correction, expression of concern) carries the same "could be wrong" text: "The notice is what Crossref records; read it to see what it changes. A correction may leave the findings intact." (`src/core/checker.ts:123`). The second sentence fits corrections but not expressions of concern or retractions, so the note does not say how those findings could be wrong. Seen with the released 0.1.1 CLI on `10.1371/journal.pone.0061107` (expression of concern). AGENTS.md hard rule 4 asks that every finding say how it could be wrong.

The new wording must not name or characterise any author. A user-facing change needs a release, which is Darren's approval.

## Acceptance criteria
- [ ] Retraction, correction and expression-of-concern findings each have could-be-wrong text that fits that notice type.
- [ ] A test covers each of the three texts, and `npm run check` passes.

## Activity

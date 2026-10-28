# Git workflow & collaboration

## Commits

- Never commit on your own — present the changes and let the maintainer
  review. Commit only after explicit approval, even when the change looks
  complete.
- When you do commit: put API-replacement rationale into the commit message or
  code comments.

## Before you start

- Leave other-branch WIP alone (e.g. `detekt.yml`, unknown doc types) — the
  working tree often contains unrelated work in progress.

## Design / UI tasks

- Analyze first, present the plan, ask open questions, and wait for feedback
  before implementing. ("Design task" = UI/visual work; for everything else,
  implement, then ask before committing.)

## Runtime quirks

- Stale HMR state causes confusing runtime errors — a hard reload fixes it;
  don't debug the template.

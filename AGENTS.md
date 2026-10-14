# AGENTS.md — ingrid-editor

Editor application: Angular 21 frontend in `frontend/`, Spring Boot server in
`server/`. A path like `src/app/...` usually means `frontend/src/app/...`.

## Essentials

- Package manager: **yarn 4** in `frontend/` — npm is blocked by `engines`.
- Frontend tests: `yarn ng test` (in `frontend/`). Never run `vitest run`
  directly — the Angular builder wires the jsdom environment.
- Typecheck: `yarn build` (full `ng build`; `ng test` does not type-check all
  Angular templates).
- Backend lint: `./gradlew :server:ktlintCheck` (also runs on staged files at
  commit time).
- Backend runtime: started from IntelliJ (run config "IgeServer", often debug
  mode); dev server on :4300 proxies `/api` to :8550. If backend changes don't
  go live, restart the IDE run/debug session via the JetBrains MCP — the
  devtools trigger-file restart is unreliable for picking up new classes.

## Workflow in one line

Never commit without explicit maintainer approval. Design/UI tasks: present a
plan and wait for feedback before implementing; everything else: implement,
then ask before committing.

## Details

- [Git workflow & collaboration](docs/agents/git-workflow.md) — commit policy,
  design-task process, other-branch WIP.
- [Build, pre-commit hook & tests](docs/agents/build-and-tests.md) — the hooks
  that fail most often, flaky specs, matSort testing.
- [Frontend conventions](docs/agents/frontend-conventions.md) — transloco,
  colors, API-replacement policy.
- [Domain pointers](docs/agents/domain.md) — document states, publication
  rights.

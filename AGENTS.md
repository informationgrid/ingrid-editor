# AGENTS.md — Notes for AI coding agents

Learnings from working in this repo. Skim this before starting; the
pre-commit hook section causes most commit failures.

## Layout & runtime

- Angular app in `frontend/`, Spring Boot server in `server/`; a path like
  `src/app/...` usually means `frontend/src/app/...`.
- Dev server on :4300 proxies `/api` to :8550. The backend is started from
  IntelliJ (run config "IgeServer", often debug mode). If backend changes
  don't go live, restart the IDE run/debug session via the JetBrains MCP —
  the devtools trigger-file restart is unreliable for picking up new classes.

## Pre-commit hook (frequent failures)

1. ktlint over staged `*.kt`/`*.kts` (gradle `:server:ktlintCheck`)
2. `yarn lint-staged` in `frontend/`: prettier --check on
   `*.{ts,scss,js,css,html,md,json}` + stop-only on `*.spec.ts`

- IDE (MCP) reformat matches ktlint but not always prettier (markdown!);
  afterwards run `yarn prettier --check` on the touched files.
- `ng test` does not type-check all Angular templates — run a full
  `ng build` before committing.
- Specs must run through `ng test`, not `vitest run` directly — the Angular
  builder wires the jsdom environment (bare vitest fails with
  "window is not defined").
- `matSort` on a table does NOT connect sorting: wire
  `dataSource.sort = this.sort()` in `ngAfterViewInit` — and write a test
  that actually re-orders rows, not just sort-state assertions.
- `upload-checksum.spec.ts` is known-flaky under full-suite load and passes
  in isolation. Verify there before blaming your change.
- Use yarn, not npm, in `frontend/`.

## Conventions

- Texts: reuse existing transloco keys (`de.json`) instead of hardcoding;
  many keys are effectively German-only.
- Colors: theme variables in `src/variables.scss` (e.g. `$tag-*-color`,
  shared by the icon tag dots and the statistics chart).
- Match the typography and style of neighboring components — the maintainer
  reviews visuals in the running app and iterates.
- Design tasks: analyze first, present the plan, ask open questions, and
  wait for feedback before implementing.
- Prefer clean API replacement over compatibility shims (few call sites);
  put the rationale into the commit message or code comments — never create
  component-specific README files.
- Leave other-branch WIP alone (e.g. `detekt.yml`, unknown doc types).
  Stale HMR state causes confusing runtime errors — a hard reload fixes it;
  don't debug the template.
- Don't commit on your own — present the changes and let the maintainer
  review and commit. Ask first even when a change looks complete; keep the
  git log clean (few, meaningful commits).

## Domain pointers (details live in the code)

- Document states P / PW / W and the statistic counters overlap on purpose —
  see `StatisticApiController`.
- Publication rights are wrapper tags (internet / intranet / amtsintern),
  precedence amtsintern > intranet > internet — see
  `DocumentUtils.checkPublicationTags` and `chart-segments.ts`.

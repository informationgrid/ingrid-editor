# Build, pre-commit hook & tests

## Pre-commit hook (causes most commit failures)

1. ktlint over staged `*.kt`/`*.kts` (gradle `:server:ktlintCheck`)
2. `yarn lint-staged` in `frontend/`: prettier --check on
   `*.{ts,scss,js,css,html,md,json}` + stop-only on `*.spec.ts`

- IDE (MCP) reformat matches ktlint but not always prettier (markdown!);
  afterwards run `yarn prettier --check` on the touched files.
- `ng test` does not type-check all Angular templates — run a full
  `ng build` before committing.

## Running specs

- Specs must run through `ng test`, not `vitest run` directly — the Angular
  builder wires the jsdom environment (bare vitest fails with
  "window is not defined").
- Runner options (timeouts raised to 20s) live in
  `frontend/vitest-base.config.mts`, wired via `runnerConfig` in `angular.json`.
- Elements with a `:leave` animation stay in the DOM ~300ms after the state
  change — poll with `vi.waitFor` instead of sleeping (see
  `form-message.component.spec.ts`), and never sleep through a production
  timeout.
- `matSort` on a table does NOT connect sorting: wire
  `dataSource.sort = this.sort()` in `ngAfterViewInit` — and write a test
  that actually re-orders rows, not just sort-state assertions.
- Spectator overwrites global matchers (`toHaveLength`, `toExist`, `toHaveText`,
  `toHaveClass`, …) with DOM-selector variants, and vitest shares one
  environment across spec files — so `expect(someString).toHaveLength(n)` passes
  alone and silently matches 0 elements in a full run. Use `.length).toBe(n)`.
- Derive the `data` section of export/transformer fixtures from a document
  actually saved in the dev instance, not from the shape you assume (select
  shapes: see frontend-conventions.md).

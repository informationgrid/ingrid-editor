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
- `matSort` on a table does NOT connect sorting: wire
  `dataSource.sort = this.sort()` in `ngAfterViewInit` — and write a test
  that actually re-orders rows, not just sort-state assertions.
- `upload-checksum.spec.ts` is known-flaky under full-suite load and passes
  in isolation. Verify there before blaming your change.
- Export/transformer fixtures must mirror what the frontend actually saves,
  not the shape you assume: form, schema, exporter and test all written
  from one unchecked assumption cross-check nothing. This shipped the
  algorithm doctype export crash (real documents with the field set threw,
  tests stayed green). Select shapes: see frontend-conventions.md. Derive
  the fixture `data` section from a document saved in the dev instance.

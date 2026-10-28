# Frontend conventions

- Texts: reuse existing transloco keys (`de.json`) instead of hardcoding;
  many keys are effectively German-only.
- Colors: theme variables in `src/variables.scss` (e.g. `$tag-*-color`,
  shared by the icon tag dots and the statistics chart).
- APIs: prefer clean replacement over compatibility shims (few call sites);
  put the rationale into the commit message or code comments.
- Select fields (`ige-select`, `addSelect`): what gets saved depends on
  `simple` — the plain option value (an array of values with `multiple`),
  otherwise an object `{key, value, _codelistId}`; authoritative source is
  `select-type.component.ts`. Static option lists (inline options, no
  codelistId) usually want `simple: true`, so a `string` schema type
  matches what is saved — but only for new fields: flipping an existing
  select makes old and newly saved documents store different shapes.
  Server-side, read object-form values via the `field.key` dot-path
  (`JsonNodeExtension.getString`).
- Never create component-specific README files.

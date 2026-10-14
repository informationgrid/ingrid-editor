# Frontend conventions

- Texts: reuse existing transloco keys (`de.json`) instead of hardcoding;
  many keys are effectively German-only.
- Colors: theme variables in `src/variables.scss` (e.g. `$tag-*-color`,
  shared by the icon tag dots and the statistics chart).
- APIs: prefer clean replacement over compatibility shims (few call sites);
  put the rationale into the commit message or code comments.
- Never create component-specific README files.

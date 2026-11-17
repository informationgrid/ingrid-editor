# Domain pointers (details live in the code)

- Publication rights are wrapper tags (internet / intranet / amtsintern),
  precedence amtsintern > intranet > internet — see
  `DocumentUtils.checkPublicationTags` and `chart-segments.ts`.
- Form controls store different value shapes in document data (e.g. select
  fields: string vs object depending on `simple`) — check
  `select-type.component.ts` and frontend-conventions.md before reading
  document fields in an exporter.
- JSON schemas are enforced on publish (`PreJsonSchemaValidator`), not on
  save — a form/schema mismatch stays invisible until export or publish.

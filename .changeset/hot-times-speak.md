---
'@vocab/core': patch
---

Add JSON Schema files for IDE validation of `translations.json` and `{lang}.translations.json`, generated from Zod definitions aligned with `TranslationData` and `getTranslationsFromFile`.

- Publish Draft-07 schemas at `@vocab/core/schemas/translations.dev.schema.json` and `@vocab/core/schemas/translations.alt.schema.json`.
- Export Zod 4 schemas from `@vocab/core/translation-json-schema` and re-export them from the main package entry.
- Extend `TranslationFileContents` with optional root `$namespace`.
- Add a `zod` dependency (Zod 4).

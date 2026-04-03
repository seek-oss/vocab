---
'@vocab/core': major
'@vocab/phrase': patch
---

Rename `withTags` to `includeTranslationMetadata` on `loadTranslation` and `loadAllTranslations`. When `false` or omitted, dev-language entries are minimal (`message` and optional `globalKey` only) and file-level `_meta.tags` are omitted from `LoadedTranslation.metadata`. When `true`, full per-key fields (`description`, `tags`, `globalKey`) and shared file tags are included.

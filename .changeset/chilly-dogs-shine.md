---
'@vocab/vite': patch
---

Deprecate `createVocabChunks`

The Vite plugin now emits a translation chunk per-language. To get a reference to an emitted chunk, use the `getChunkName` API from `@vocab/vite/chunks`.

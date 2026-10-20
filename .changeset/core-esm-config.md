---
'@vocab/core': minor
---

Support ESM Vocab config files (`vocab.config.mjs`, or `vocab.config.js` in a `"type": "module"` package). ESM configs are loaded via Node's `require(esm)`, so top-level `await` is not supported.

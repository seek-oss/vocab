---
'@vocab/vite': patch
---

Fix locale chunk splitting for hyphenated locale names

Previously translations for en-AU and en-NZ would be merged into a single en file when bundling.
Locale chunks should now be split by any valid BCP 47 Tag.

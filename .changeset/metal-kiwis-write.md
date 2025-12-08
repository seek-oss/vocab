---
'@vocab/webpack': patch
'@vocab/vite': patch
---

Deprecate `compiledVocabFileFilter`

`compiledVocabFileFilter` has been deprecated. Please import it from `@vocab/core` instead.

**MIGRATION GUIDE**:
```diff
-import { compiledVocabFileFilter } from '@vocab/webpack';
-import { compiledVocabFileFilter } from '@vocab/vite';
+import { compiledVocabFileFilter } from '@vocab/core';
```

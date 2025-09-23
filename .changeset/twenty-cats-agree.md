---
'@vocab/vite': minor
---

Replace default plugin export with named `vitePluginVocab` export

**BREAKING CHANGE**

This package no longer provides a default export. You must now import the named export `vitePluginVocab` instead.

**EXAMPLE USAGE**

```diff
-import vitePluginVocab from '@vocab/vite';
+import { vitePluginVocab } from '@vocab/vite';
```

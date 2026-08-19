---
"@vocab/vite": patch
---

Make production-client `getLoadedMessages` succeed after the language chunk is installed, matching webpack.

Evaluating `{lang}-translations` (or calling `.load()` on any file for that language) now registers all messages for that language, so sync reads work without a per-file `import()` having resolved first.

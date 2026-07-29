---
'@vocab/core': patch
---

Fix watch mode failing to ignore `node_modules` and `.git` when the project path contains a directory segment that starts with `.`.

Previously, picomatch’s `**` did not traverse those segments in the watcher ignore matcher, so chokidar could watch the entire dependency tree and hit EMFILE.
Watch ignores now pass `{ dot: true }`, matching the existing translation discovery glob.

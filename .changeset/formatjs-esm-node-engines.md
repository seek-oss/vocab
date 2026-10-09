---
'@vocab/cli': patch
'@vocab/core': patch
'@vocab/phrase': patch
'@vocab/react': patch
'@vocab/rollup-plugin': patch
'@vocab/vite': patch
'@vocab/webpack': patch
---

Require Node.js `^20.19.0 || >=22.12.0` to load ESM-only FormatJS from CommonJS.

This is not a breaking change. These packages already depended on recent Node.js versions in practice; `engines` now states that requirement.

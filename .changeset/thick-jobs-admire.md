---
'@vocab/core': patch
'@vocab/webpack': patch
---

Add exports to packages with multiple entry points. This fixes
`ERR_UNSUPPORTED_DIR_IMPORT` issues e.g. with NextJS or other setups, which
rely on the new node resolver when using ESM packages.

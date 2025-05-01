---
'@vocab/vite': minor
---

`vite`: Rename exports in the Vite plugin

> Note: This is a breaking change if you used either of the exports below, however, since this plugin is still experimental it is being released as a minor change.

### Renamed exports

Moves a few of the Vite plugin functions under different export paths for better organisation. The functions themselves have not changed, only their exported location.

* `@vocab/vite/create-language` -> `@vocab/vite/runtime`
* `@vocab/vite/create-vocab-chunks` -> `@vocab/vite/chunks`

### New function available

A `getChunkName` function is now exported under `@vocab/vite/chunks`.
 
---
'@vocab/vite': patch
---

Emit standalone translation chunks

Translation chunks emitted by the Vite plugin are now isolated from your app's module graph, enabling preloading of translations before client-side hydration.

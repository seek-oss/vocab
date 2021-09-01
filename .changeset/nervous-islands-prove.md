---
'@vocab/react': minor
---

Automatically assign keys to React elements

Previously, when using React elements within translation templates, React would warn about missing keys as the return type is an array. This meant you needed to supply a key manually. Vocab can now automatically assign a key to React elements. Keys that are passed explicitly will remain untouched. 
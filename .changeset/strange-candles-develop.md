---
'@vocab/phrase': patch
---

Fix forbidden errors when pushing translations

Migrate from `form-data` npm package to the native [Node FormData class](https://nodejs.org/api/globals.html#class-formdata) to ensure compatibility with the earlier move to native Fetch.

Mixing the two was causing some consumers to receive 503 Forbidden errors when pushing translations to Phrase.

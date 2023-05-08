---
'@vocab/phrase': patch
---

Upload translations in a separate file per language

Fixes a regression introduced when [support for Phrase tags was added][phrase tags pr].
Part of adding support for tags involved swapping to uploading translations in a CSV file instead of a JSON file.
This had the unintended (and undocumented) side-effect of creating missing languages in the target Phrase project.
This is unnecessary in the case where the language doesn't actually have any translations and/or derives its translations from a parent language.
Only languages that actually have translations (i.e. they have messages defined in a `translations.json` file) will be created in the target Phrase project.

[phrase tags pr]: https://github.com/seek-oss/vocab/pull/101

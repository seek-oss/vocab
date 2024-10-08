---
'@vocab/phrase': patch
---

Fix translation issue caused by mismatched Phrase locale identifiers.

Previous behaviour meant that translations were pushed using the locale name in Phrase, but Vocab was retrieving translations by locale code. Phrase locale codes and locale names are not always alligned. This would lead to Vocab searching for translations by code rather than name, often resulting in missing translations.

Vocab now consistently pushes and pulls translations using Phrase’s locale name, regardless of the locale code set in Phrase.

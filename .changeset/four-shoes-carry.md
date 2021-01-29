---
'@vocab/core': patch
'@vocab/react': patch
'@vocab/types': patch
'@vocab/webpack': patch
---

Enable the use of translation files directly with 3 new documented methods for working with translations.

```typescript
/**
 *  Retrieve messages. If not available, will attempt to load messages and resolve once complete.
 */
translations.getMessages(language);
/**
 *  Retrieve already loaded messages. Will return null if messages haven't been loaded.
 */
translations.getLoadedMessages(language);
/**
 *  Load messages for the given language. Resolving once complete.
 */
translations.load(language);
```
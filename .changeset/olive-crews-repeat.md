---
'@vocab/core': minor
---

Add `TranslationKeys` type

The `TranslationKeys` type can be used to get a string literal union of all the translation keys used in a translation file.

**EXAMPLE USAGE**

```jsonc
// .vocab/en.translations.json
{
  "Hello": {
    "message": "Hello"
  },
  "Goodbye": {
    "message": "Goodbye"
  }
}
```

After running `vocab compile`:

```tsx
import type { TranslationKeys } from '@vocab/core';
import translations from './.vocab';

// 'Hello' | 'Goodbye'
type Keys = TranslationKeys<typeof translations>;
```

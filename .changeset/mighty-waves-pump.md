---
'@vocab/core': patch
---

Enable the `TranslationKeys` type to operate on a union of translations

**EXAMPLE USAGE**

```tsx
import { TranslationKeys } from '@vocab/core';
import fooTranslations from './foo.vocab';
import barTranslations from './bar.vocab';

type FooBarTranslationKeys = TranslationKeys<typeof fooTranslations | typeof barTranslations>;
```

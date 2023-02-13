---
'@vocab/core': minor
---

`loadTranslation`, `loadAllTranslations`: Support loading translations with or without tags

[Tags] can be conditionally loaded alongside translations by specifying the appropriate `withTags` value.
By default, tags will not be loaded. Tags will also never be loaded for non-dev languages.

**EXAMPLE USAGE**:

```tsx
import type { UserConfig } from '@vocab/types';
import { loadTranslation, loadAllTranslations } from '@vocab/core';

const userConfig: UserConfig = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'th' }],
};

const translations = loadTranslation(
  {
    filePath: '/path/to/translations.json',
    fallbacks: 'valid',
    withTags: true,
  },
  userConfig,
);

const allTranslations = loadAllTranslations(
  { fallbacks: 'valid', includeNodeModules: false, withTags: true },
  userConfig,
);
```

[tags]: https://github.com/seek-oss/vocab#tags

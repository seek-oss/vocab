---
'@vocab/phrase': minor
---

Add an optional `errorOnNoGlobalKeyTranslation` flag to `pull` function. If set to `true`, it will error if a translation is missing in Phrase for a translation with a global key.

**EXAMPLE USAGE**:

```js
import { pull } from '@vocab/phrase';

const vocabConfig = {
    devLanguage: 'en',
    language: ['en', 'fr'],
};

await pull({ branch: 'myBranch', errorOnNoGlobalKeyTranslation: true }, vocabConfig);
```



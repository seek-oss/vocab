---
'@vocab/phrase': minor
---

Add an optional `deleteUnusedKeys` flag to the `push` function. If set to `true`, unused keys will be deleted from Phrase after translations are pushed.

**EXAMPLE USAGE**:

```js
import { push } from '@vocab/phrase';

const vocabConfig = {
  devLanguage: 'en',
  language: ['en', 'fr']
};

await push(
  { branch: 'myBranch', deleteUnusedKeys: true },
  vocabConfig
);
```

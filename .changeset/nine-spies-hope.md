---
'@vocab/pseudo-localize': minor
---

This package exposes low-level functions for pseudo-localization.

```ts
import {
  pseudoLocalize,
  extendVowels,
  substituteCharacters
} from '@vocab/pseudo-localize';

const message = 'Hello';

// Ḩẽƚƚö
const substitutedMessage = substituteCharacters(message);

// Heelloo
const extendedMessage = extendVowels(message);

// Extend the message and then substitute characters
// Ḩẽẽƚƚöö
const pseudoLocalizedMessage = pseudoLocalize(message);
```

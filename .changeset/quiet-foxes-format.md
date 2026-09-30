---
'@vocab/core': minor
---

Add `formatter` config option to support formatting generated files with [oxfmt]

Generated translation files are formatted with Prettier by default. Set `formatter: 'oxfmt'` to format them with the oxfmt CLI instead, which resolves your oxfmt configuration as usual.

**EXAMPLE USAGE**:

```js
// vocab.config.js
module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }],
  formatter: 'oxfmt',
};
```

[oxfmt]: https://oxc.rs/docs/guide/usage/formatter.html

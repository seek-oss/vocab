---
'@vocab/core': minor
'@vocab/types': minor
'@vocab/webpack': minor
---

Enable the creation of generated languages via the `generatedLanguages` config.

Generated languages are created by running a `generator` function over every translation message in an existing translation.
The `generator` function can be any function that accepts a string and returns a string.
By default, a generated language's messages will be based off the `devLanguage`'s messages, but this can be overridden by providing an `extends` value that references another language.

**vocab.config.js**

```js
function generator(message) {
  return message + ' Generated';
}

module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }],
  generatedLanguages: [
    {
      name: 'generatedLanguage',
      extends: 'en',
      generator
    }
  ]
};
```

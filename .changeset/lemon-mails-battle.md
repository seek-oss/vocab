---
'@vocab/phrase': minor
'@vocab/core': minor
---

`vocab push` and `vocab pull` can support global keys mapping. When you want certain translations to use a specific/custom key in Phrase, add the `globalKey` to the structure.

**EXAMPLE USAGE**:

```jsonc
// translations.json
{
  "Hello": {
    "message": "Hello",
    "globalKey": "hello"
  },
  "Goodbye": {
    "message": "Goodbye",
    "globalKey": "app.goodbye.label"
  }
}
```

In the above example,

- `vocab push` will push the `hello` and `app.goodbye.label` keys to Phrase.
- `vocab pull` will pull translations from Phrase and map them to the `hello` and `app.goodbye.label` keys.

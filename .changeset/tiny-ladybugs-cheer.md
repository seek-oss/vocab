---
'@vocab/phrase': minor
---

Support uploading tags to Phrase

The `push` API now supports uploading [tags] to Phrase.
Tags can be added to an individual key via the `tags` property:

```jsonc
// translations.json
{
  "Hello": {
    "message": "Hello",
    "tags": ["greeting", "home_page"]
  },
  "Goodbye": {
    "message": "Goodbye",
    "tags": ["home_page"]
  }
}
```

Tags can also be added under a top-level `_meta` field. This will result in the tags applying to all
translation keys specified in the file:

```jsonc
// translations.json
{
  "_meta": {
    "tags": ["home_page"]
  },
  "Hello": {
    "message": "Hello",
    "tags": ["greeting"]
  },
  "Goodbye": {
    "message": "Goodbye",
  }
}
```

In the above example, both the `Hello` and `Goodbye` keys would have the `home_page` tag attached to
them, but only the `Hello` key would have the `usage_greeting` tag attached to it.

**NOTE**: Only tags specified on keys in your [`devLanguage`][configuration] will be uploaded. Tags on keys in other
languages will be ignored.

[tags]: https://support.phrase.com/hc/en-us/articles/5822598372252-Tags-Strings-
[configuration]: https://github.com/seek-oss/vocab#configuration

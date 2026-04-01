---
'@vocab/core': patch
---

Support for multiple languages in a single file

It's now easier to see and compare your translations across languages and adding new languages no-longer means creating new files.

Translations can now store each languages message within the initial translations.json file.

Replace the `message` value with a key-value pair of language to messages

```diff
{
  "my key": {
-    "message": "Hello from Vocab",
+    "messages": {
+      "en": "Hello from Vocab",
+      "fr": "Bonjour de Vocab"
+    },
    "description": "Example hello message"
  }
}
```

Messages in other files are still supported.

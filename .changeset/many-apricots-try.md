---
'@vocab/cli': minor
---

Error on no translation for global key

By default, `vocab pull` will not error if a translation is missing in Phrase for a translation with a global key.
If you want to throw an error in this situation, pass the `--error-on-no-global-key-translation` flag:

**EXAMPLE USAGE**:

```sh
vocab pull --error-on-no-global-key-translation
```

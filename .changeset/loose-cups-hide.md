---
"@vocab/cli": minor
"@vocab/phrase": minor
---

Add auto-translate feature for push command

Adds a new `--auto-translate` flag to the `vocab push` command that enables automatic translation for missing translations in the Phrase platform. When enabled, this flag instructs Phrase to automatically translate any missing keys using machine translation.
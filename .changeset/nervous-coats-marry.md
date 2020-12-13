---
'@vocab/cli': patch
'@vocab/core': patch
'@vocab/phrase': patch
'@vocab/react': patch
'@vocab/types': patch
'@vocab/webpack': patch
---

Compile useable TypeScript importable files with `vocab compile`.

The new `vocab compile` step replaces `vocab generate-types` in creating a fully functional **translations.ts** file.

This allows vocab to be used **without the Webpack Plugin**, however use of the plugin is still heavily advised to ensure optimal loading of translation content on the web.

Support for unit testing is now better than ever! The newly created **translations.ts** means your unit test code will see the same code as available while rendering.

See the [documentation](https://github.com/seek-oss/vocab) for further usage details.

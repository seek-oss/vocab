# @vocab/types

## 1.3.8

### Patch Changes

- Updated dependencies [[`5444b6a`](https://github.com/seek-oss/vocab/commit/5444b6ae5c344033672d9ae20d72c3e32c1fc70d)]:
  - @vocab/core@1.6.4

## 1.3.7

### Patch Changes

- Updated dependencies [[`2e21978`](https://github.com/seek-oss/vocab/commit/2e21978b30b04826f22f3631e9a7adef3be09dc2)]:
  - @vocab/core@1.6.3

## 1.3.6

### Patch Changes

- Updated dependencies [[`1c1702d`](https://github.com/seek-oss/vocab/commit/1c1702d1b62804a91b53b12a8ac1d7a77dc74743)]:
  - @vocab/core@1.6.2

## 1.3.5

### Patch Changes

- Updated dependencies [[`79a1c13`](https://github.com/seek-oss/vocab/commit/79a1c13a95c3f7b985c0ed551a79fcbc7072ff95), [`79a1c13`](https://github.com/seek-oss/vocab/commit/79a1c13a95c3f7b985c0ed551a79fcbc7072ff95)]:
  - @vocab/core@1.6.1

## 1.3.4

### Patch Changes

- Updated dependencies [[`8228608`](https://github.com/seek-oss/vocab/commit/8228608a1c8bd2f1de0ac65401cad447b30fc0a8)]:
  - @vocab/core@1.6.0

## 1.3.3

### Patch Changes

- Updated dependencies [[`161d698`](https://github.com/seek-oss/vocab/commit/161d698f7fd198f594a765104f02261d2e45f007)]:
  - @vocab/core@1.5.0

## 1.3.2

### Patch Changes

- Updated dependencies [[`09b7179`](https://github.com/seek-oss/vocab/commit/09b7179f77311886e4c0e53ca85d2e260f51dd30)]:
  - @vocab/core@1.4.0

## 1.3.1

### Patch Changes

- Updated dependencies [[`4e3c2f9`](https://github.com/seek-oss/vocab/commit/4e3c2f96111ba3f85fa9f5277934a9b43e6fd639)]:
  - @vocab/core@1.3.1

## 1.3.0

### Minor Changes

- [`16853dd`](https://github.com/seek-oss/vocab/commit/16853dd68f62c66013fea287cc0dbeafaec46351) [#137](https://github.com/seek-oss/vocab/pull/137) Thanks [@mrm007](https://github.com/mrm007)! - Absorb types into `@vocab/core`

  `@vocab/types` re-exports all types from `@vocab/core` and will be deprecated and removed in the near future.

### Patch Changes

- [`ff418be`](https://github.com/seek-oss/vocab/commit/ff418be8f5b805b4c6f8b3046992a46e7a4138e9) [#138](https://github.com/seek-oss/vocab/pull/138) Thanks [@mrm007](https://github.com/mrm007)! - Remove [unused] `ICUFormatResult` type

  [unused]: https://github.com/search?q=+%2FICUFormatResult%2F&type=code

- Updated dependencies [[`16853dd`](https://github.com/seek-oss/vocab/commit/16853dd68f62c66013fea287cc0dbeafaec46351), [`5822b5e`](https://github.com/seek-oss/vocab/commit/5822b5e820ab7bf29d283c1d1c0925eacb783c46), [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef)]:
  - @vocab/core@1.3.0

## 1.2.0

### Minor Changes

- [`fa1d81f`](https://github.com/seek-oss/vocab/commit/fa1d81fb716928a822985e2193bf98ebd422009f) [#121](https://github.com/seek-oss/vocab/pull/121) Thanks [@askoufis](https://github.com/askoufis)! - Add `StringWithSuggestions` utility type

  This type is equivalent to the `string` type, but it tricks the language server into providing suggestions for string literals passed into the `Suggestions` generic parameter.

  **EXAMPLE USAGE**:

  ```ts
  type AnyAnimal = StringWithSuggestions<'cat' | 'dog'>;
  // Suggests cat and dog, but accepts any string
  const animal: AnyAnimal = '';
  ```

## 1.1.2

### Patch Changes

- [`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f) [#99](https://github.com/seek-oss/vocab/pull/99) Thanks [@askoufis](https://github.com/askoufis)! - Exclude source files from package build

## 1.1.1

### Patch Changes

- [`e5a066c`](https://github.com/seek-oss/vocab/commit/e5a066c8a7539a62a9c1c4d813aa87461ba43cdc) [#96](https://github.com/seek-oss/vocab/pull/96) Thanks [@askoufis](https://github.com/askoufis)! - Update `intl-messageformat` dependencies

## 1.1.0

### Minor Changes

- [`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd) [#80](https://github.com/seek-oss/vocab/pull/80) Thanks [@askoufis](https://github.com/askoufis)! - Enable the creation of generated languages via the `generatedLanguages` config.
  See [the docs] for more information and examples.

  [the docs]: https://github.com/seek-oss/vocab#generated-languages

## 1.0.1

### Patch Changes

- [`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a) [#63](https://github.com/seek-oss/vocab/pull/63) Thanks [@jahredhope](https://github.com/jahredhope)! - Migrate to new @formatjs/icu-messageformat-parser as intl-messageformat-parser has been deprecated

## 1.0.0

### Major Changes

- [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c) [#51](https://github.com/seek-oss/vocab/pull/51) Thanks [@jahredhope](https://github.com/jahredhope)! - Release v1.0.0

  Release Vocab as v1.0.0 to signify a stable API and support future [semver versioning](https://semver.org/) releases.

  Vocab has seen a lot of iteration and changes since it was first published on 20 November 2020. We are now confident with the API and believe Vocab is ready for common use.

### Patch Changes

- [`0074382`](https://github.com/seek-oss/vocab/commit/007438273ef70f5d5ded45777933651ad8df36f6) [#52](https://github.com/seek-oss/vocab/pull/52) Thanks [@jahredhope](https://github.com/jahredhope)! - Remove React dependency on core types.

  Direct use of tags in Translations now have stricter type definitions.

## 0.0.9

### Patch Changes

- [`5b1fdc0`](https://github.com/seek-oss/vocab/commit/5b1fdc019522b12e7ef94b2fec57b54a9310d41c) [#46](https://github.com/seek-oss/vocab/pull/46) Thanks [@jahredhope](https://github.com/jahredhope)! - Enable the use of translation files directly with 3 new documented methods for working with translations.

  ```typescript
  /**
   *  Retrieve messages. If not available, will attempt to load messages and resolve once complete.
   */
  translations.getMessages(language);
  /**
   *  Retrieve already loaded messages. Will return null if messages haven't been loaded.
   */
  translations.getLoadedMessages(language);
  /**
   *  Load messages for the given language. Resolving once complete.
   */
  translations.load(language);
  ```

## 0.0.8

### Patch Changes

- [`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d) [#36](https://github.com/seek-oss/vocab/pull/36) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support custom locales for ICU message parsing

## 0.0.7

### Patch Changes

- [`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245) [#33](https://github.com/seek-oss/vocab/pull/33) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Move all vocab files to single directory with configurable suffix

* [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb) [#34](https://github.com/seek-oss/vocab/pull/34) Thanks [@jahredhope](https://github.com/jahredhope)! - Validate translation files as loaded. Providing additional error messaging.

## 0.0.6

### Patch Changes

- [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab) [#27](https://github.com/seek-oss/vocab/pull/27) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add `ignore` config for ignoring files/folders from cli scripts

## 0.0.5

### Patch Changes

- [`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2) [#19](https://github.com/seek-oss/vocab/pull/19) Thanks [@jahredhope](https://github.com/jahredhope)! - Compile useable TypeScript importable files with `vocab compile`.

  The new `vocab compile` step replaces `vocab generate-types` in creating a fully functional **translations.ts** file.

  This allows vocab to be used **without the Webpack Plugin**, however use of the plugin is still heavily advised to ensure optimal loading of translation content on the web.

  Support for unit testing is now better than ever! The newly created **translations.ts** means your unit test code will see the same code as available while rendering.

  See the [documentation](https://github.com/seek-oss/vocab) for further usage details.

## 0.0.4

### Patch Changes

- [`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e) [#14](https://github.com/seek-oss/vocab/pull/14) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add ability to override files namespace with \$namespace

## 0.0.3

### Patch Changes

- [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b) [#8](https://github.com/seek-oss/vocab/pull/8) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Update types

## 0.0.2

### Patch Changes

- [`9f99ea7`](https://github.com/seek-oss/vocab/commit/9f99ea7c827ec4d7c21a485e17e3adbbd1c49319) Thanks [@jahredhope](https://github.com/jahredhope)! - Remove React as dependency and target node

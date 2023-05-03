# @vocab/react

## 1.1.6

### Patch Changes

- Updated dependencies [[`4e3c2f9`](https://github.com/seek-oss/vocab/commit/4e3c2f96111ba3f85fa9f5277934a9b43e6fd639)]:
  - @vocab/core@1.3.1

## 1.1.5

### Patch Changes

- Updated dependencies [[`16853dd`](https://github.com/seek-oss/vocab/commit/16853dd68f62c66013fea287cc0dbeafaec46351), [`5822b5e`](https://github.com/seek-oss/vocab/commit/5822b5e820ab7bf29d283c1d1c0925eacb783c46), [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef)]:
  - @vocab/core@1.3.0

## 1.1.4

### Patch Changes

- [`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f) [#99](https://github.com/seek-oss/vocab/pull/99) Thanks [@askoufis](https://github.com/askoufis)! - Exclude source files from package build

- Updated dependencies [[`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f)]:
  - @vocab/types@1.1.2

## 1.1.3

### Patch Changes

- [`e5a066c`](https://github.com/seek-oss/vocab/commit/e5a066c8a7539a62a9c1c4d813aa87461ba43cdc) [#96](https://github.com/seek-oss/vocab/pull/96) Thanks [@askoufis](https://github.com/askoufis)! - Update `intl-messageformat` dependencies

- Updated dependencies [[`e5a066c`](https://github.com/seek-oss/vocab/commit/e5a066c8a7539a62a9c1c4d813aa87461ba43cdc)]:
  - @vocab/types@1.1.1

## 1.1.2

### Patch Changes

- [`240d6ad`](https://github.com/seek-oss/vocab/commit/240d6ad7e0cf43fed92655a2f95fb463bd7b6644) [#85](https://github.com/seek-oss/vocab/pull/85) Thanks [@askoufis](https://github.com/askoufis)! - The `t` function returned from `useTranslations` is now memoized. `t` should now only change after the initial loading of translations, and when the language changes, making it more useful inside a hook's dependency array.

## 1.1.1

### Patch Changes

- [`e9c7067`](https://github.com/seek-oss/vocab/commit/e9c7067b31215a176e70ac1e73f2c878107f328f) [#83](https://github.com/seek-oss/vocab/pull/83) Thanks [@michaeltaranto](https://github.com/michaeltaranto)! - Add React 18 support

## 1.1.0

### Minor Changes

- [`6de02b3`](https://github.com/seek-oss/vocab/commit/6de02b35839e8ecdd9016fec49a95e17d3696f87) [#69](https://github.com/seek-oss/vocab/pull/69) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Automatically assign keys to React elements

  Previously, when using React elements within translation templates, React would warn about missing keys as the return type is an array. This meant you needed to supply a key manually. Vocab can now automatically assign a key to React elements. Keys that are passed explicitly will remain untouched.

## 1.0.2

### Patch Changes

- [`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a) [#63](https://github.com/seek-oss/vocab/pull/63) Thanks [@jahredhope](https://github.com/jahredhope)! - Migrate to new @formatjs/icu-messageformat-parser as intl-messageformat-parser has been deprecated

- Updated dependencies [[`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a)]:
  - @vocab/types@1.0.1

## 1.0.1

### Patch Changes

- [`c9a38dd`](https://github.com/seek-oss/vocab/commit/c9a38dd15e2c2a47fc4d5eb2348fdd08a6982768) [#54](https://github.com/seek-oss/vocab/pull/54) Thanks [@jahredhope](https://github.com/jahredhope)! - Allow special characters within translation keys and messages

* [`c9a38dd`](https://github.com/seek-oss/vocab/commit/c9a38dd15e2c2a47fc4d5eb2348fdd08a6982768) [#54](https://github.com/seek-oss/vocab/pull/54) Thanks [@jahredhope](https://github.com/jahredhope)! - Add a warning when accessing a key that doesn't exist

## 1.0.0

### Major Changes

- [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c) [#51](https://github.com/seek-oss/vocab/pull/51) Thanks [@jahredhope](https://github.com/jahredhope)! - Release v1.0.0

  Release Vocab as v1.0.0 to signify a stable API and support future [semver versioning](https://semver.org/) releases.

  Vocab has seen a lot of iteration and changes since it was first published on 20 November 2020. We are now confident with the API and believe Vocab is ready for common use.

### Patch Changes

- [`0074382`](https://github.com/seek-oss/vocab/commit/007438273ef70f5d5ded45777933651ad8df36f6) [#52](https://github.com/seek-oss/vocab/pull/52) Thanks [@jahredhope](https://github.com/jahredhope)! - Remove React dependency on core types.

  Direct use of tags in Translations now have stricter type definitions.

- Updated dependencies [[`0074382`](https://github.com/seek-oss/vocab/commit/007438273ef70f5d5ded45777933651ad8df36f6), [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c)]:
  - @vocab/types@1.0.0

## 0.0.12

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

- Updated dependencies [[`5b1fdc0`](https://github.com/seek-oss/vocab/commit/5b1fdc019522b12e7ef94b2fec57b54a9310d41c)]:
  - @vocab/types@0.0.9

## 0.0.11

### Patch Changes

- [`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d) [#36](https://github.com/seek-oss/vocab/pull/36) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support custom locales for ICU message parsing

* [`6c725f4`](https://github.com/seek-oss/vocab/commit/6c725f43c5eaed9b248c8452ff6f83cef1b2f61c) [#35](https://github.com/seek-oss/vocab/pull/35) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Rename `useTranslation` to `useTranslations`

* Updated dependencies [[`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d)]:
  - @vocab/types@0.0.8

## 0.0.10

### Patch Changes

- Updated dependencies [[`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb)]:
  - @vocab/types@0.0.7

## 0.0.9

### Patch Changes

- Updated dependencies [[`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab)]:
  - @vocab/types@0.0.6

## 0.0.8

### Patch Changes

- [`b51db12`](https://github.com/seek-oss/vocab/commit/b51db125b6d5e29feb77eac20a45b410e79be9b2) [#21](https://github.com/seek-oss/vocab/pull/21) Thanks [@jahredhope](https://github.com/jahredhope)! - Rename TranslationsProvider to VocabProvider

## 0.0.7

### Patch Changes

- [`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2) [#19](https://github.com/seek-oss/vocab/pull/19) Thanks [@jahredhope](https://github.com/jahredhope)! - Compile useable TypeScript importable files with `vocab compile`.

  The new `vocab compile` step replaces `vocab generate-types` in creating a fully functional **translations.ts** file.

  This allows vocab to be used **without the Webpack Plugin**, however use of the plugin is still heavily advised to ensure optimal loading of translation content on the web.

  Support for unit testing is now better than ever! The newly created **translations.ts** means your unit test code will see the same code as available while rendering.

  See the [documentation](https://github.com/seek-oss/vocab) for further usage details.

- Updated dependencies [[`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2)]:
  - @vocab/types@0.0.5

## 0.0.6

### Patch Changes

- [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a) [#16](https://github.com/seek-oss/vocab/pull/16) Thanks [@jahredhope](https://github.com/jahredhope)! - Enable debugging with DEBUG environment variable

- Updated dependencies [[`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e)]:
  - @vocab/types@0.0.4

## 0.0.5

### Patch Changes

- [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b) [#8](https://github.com/seek-oss/vocab/pull/8) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Infer `t` return type more intelligently

  The translate key function (`t`) will now infer the return type as ReactNode only when the tag syntax is used.

- Updated dependencies [[`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b)]:
  - @vocab/types@0.0.3

## 0.0.4

### Patch Changes

- [`45c4fe2`](https://github.com/seek-oss/vocab/commit/45c4fe273c5157475cb03ca57db662956ad5cbc9) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Improved type definitions for `t` function

## 0.0.3

### Patch Changes

- [`f79c85e`](https://github.com/seek-oss/vocab/commit/f79c85e37c5b927306866961cf6cb3c541d0d6cf) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add @vocab/types dep

## 0.0.2

### Patch Changes

- [`9f99ea7`](https://github.com/seek-oss/vocab/commit/9f99ea7c827ec4d7c21a485e17e3adbbd1c49319) Thanks [@jahredhope](https://github.com/jahredhope)! - Remove React as dependency and target node

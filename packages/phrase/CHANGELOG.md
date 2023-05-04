# @vocab/phrase

## 1.2.6

### Patch Changes

- [`c0459e0`](https://github.com/seek-oss/vocab/commit/c0459e0f34f36f7d96f6cd3e2ed93b1f3f8a0756) [#149](https://github.com/seek-oss/vocab/pull/149) Thanks [@askoufis](https://github.com/askoufis)! - Update descriptions when pushing translations

## 1.2.5

### Patch Changes

- Updated dependencies [[`4e3c2f9`](https://github.com/seek-oss/vocab/commit/4e3c2f96111ba3f85fa9f5277934a9b43e6fd639)]:
  - @vocab/core@1.3.1

## 1.2.4

### Patch Changes

- Updated dependencies [[`16853dd`](https://github.com/seek-oss/vocab/commit/16853dd68f62c66013fea287cc0dbeafaec46351), [`5822b5e`](https://github.com/seek-oss/vocab/commit/5822b5e820ab7bf29d283c1d1c0925eacb783c46), [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef)]:
  - @vocab/core@1.3.0

## 1.2.3

### Patch Changes

- Updated dependencies [[`ec98685`](https://github.com/seek-oss/vocab/commit/ec98685f9bc0f609a750137ca8a2793552dfabed), [`ec98685`](https://github.com/seek-oss/vocab/commit/ec98685f9bc0f609a750137ca8a2793552dfabed)]:
  - @vocab/core@1.2.5

## 1.2.2

### Patch Changes

- Updated dependencies [[`a4944b0`](https://github.com/seek-oss/vocab/commit/a4944b062fc23296116f73c1c37fdd4f4be07ef6)]:
  - @vocab/core@1.2.4

## 1.2.1

### Patch Changes

- [`b39462c`](https://github.com/seek-oss/vocab/commit/b39462c6782948de8620f365440fffa91ddb3eec) [#124](https://github.com/seek-oss/vocab/pull/124) Thanks [@jahredhope](https://github.com/jahredhope)! - Display the remaining seconds in the rate limit relative to now.

## 1.2.0

### Minor Changes

- [`30d643d`](https://github.com/seek-oss/vocab/commit/30d643d4f1e7034a862b10c9764fa9bb31251b80) [#101](https://github.com/seek-oss/vocab/pull/101) Thanks [@askoufis](https://github.com/askoufis)! - Support uploading tags to Phrase

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
      "message": "Goodbye"
    }
  }
  ```

  In the above example, both the `Hello` and `Goodbye` keys would have the `home_page` tag attached to
  them, but only the `Hello` key would have the `usage_greeting` tag attached to it.

  **NOTE**: Only tags specified on keys in your [`devLanguage`][configuration] will be uploaded. Tags on keys in other
  languages will be ignored.

  [tags]: https://support.phrase.com/hc/en-us/articles/5822598372252-Tags-Strings-
  [configuration]: https://github.com/seek-oss/vocab#configuration

### Patch Changes

- [`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f) [#99](https://github.com/seek-oss/vocab/pull/99) Thanks [@askoufis](https://github.com/askoufis)! - Exclude source files from package build

- Updated dependencies [[`30d643d`](https://github.com/seek-oss/vocab/commit/30d643d4f1e7034a862b10c9764fa9bb31251b80), [`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f)]:
  - @vocab/core@1.2.0
  - @vocab/types@1.1.2

## 1.1.0

### Minor Changes

- [`66ed22c`](https://github.com/seek-oss/vocab/commit/66ed22cac6f89018d5fd69fd6f6408e090e1a382) [#93](https://github.com/seek-oss/vocab/pull/93) Thanks [@askoufis](https://github.com/askoufis)! - Add an optional `deleteUnusedKeys` flag to the `push` function. If set to `true`, unused keys will be deleted from Phrase after translations are pushed.

  **EXAMPLE USAGE**:

  ```js
  import { push } from '@vocab/phrase';

  const vocabConfig = {
    devLanguage: 'en',
    language: ['en', 'fr'],
  };

  await push({ branch: 'myBranch', deleteUnusedKeys: true }, vocabConfig);
  ```

### Patch Changes

- [`159d559`](https://github.com/seek-oss/vocab/commit/159d559c87c66c3e91c707fb45a1f67ebec07b4d) [#91](https://github.com/seek-oss/vocab/pull/91) Thanks [@askoufis](https://github.com/askoufis)! - Improve error message when Phrase doesn't return any translations for the dev language

## 1.0.1

### Patch Changes

- [`20eec77`](https://github.com/seek-oss/vocab/commit/20eec770705d05048ad8b32575cb92720b887f5b) [#76](https://github.com/seek-oss/vocab/pull/76) Thanks [@askoufis](https://github.com/askoufis)! - `vocab pull` no longer errors when phrase returns no translations for a configured language

## 1.0.0

### Major Changes

- [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c) [#51](https://github.com/seek-oss/vocab/pull/51) Thanks [@jahredhope](https://github.com/jahredhope)! - Release v1.0.0

  Release Vocab as v1.0.0 to signify a stable API and support future [semver versioning](https://semver.org/) releases.

  Vocab has seen a lot of iteration and changes since it was first published on 20 November 2020. We are now confident with the API and believe Vocab is ready for common use.

### Patch Changes

- Updated dependencies [[`0074382`](https://github.com/seek-oss/vocab/commit/007438273ef70f5d5ded45777933651ad8df36f6), [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c)]:
  - @vocab/core@1.0.0
  - @vocab/types@1.0.0

## 0.0.11

### Patch Changes

- Updated dependencies [[`5b1fdc0`](https://github.com/seek-oss/vocab/commit/5b1fdc019522b12e7ef94b2fec57b54a9310d41c)]:
  - @vocab/core@0.0.11
  - @vocab/types@0.0.9

## 0.0.10

### Patch Changes

- Updated dependencies [[`7c96a14`](https://github.com/seek-oss/vocab/commit/7c96a142f602132d38c1df1a47a1f4657dc5c94c)]:
  - @vocab/core@0.0.10

## 0.0.9

### Patch Changes

- Updated dependencies [[`3034bd3`](https://github.com/seek-oss/vocab/commit/3034bd3de610a9d1f3bfbd8caefa27064dee2710), [`c110745`](https://github.com/seek-oss/vocab/commit/c110745b79df1a8ade6b1d8a49e798b04a7b95e1)]:
  - @vocab/core@0.0.9

## 0.0.8

### Patch Changes

- Updated dependencies [[`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d)]:
  - @vocab/core@0.0.8
  - @vocab/types@0.0.8

## 0.0.7

### Patch Changes

- [`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245) [#33](https://github.com/seek-oss/vocab/pull/33) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Move all vocab files to single directory with configurable suffix

- Updated dependencies [[`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245), [`ad0d240`](https://github.com/seek-oss/vocab/commit/ad0d2404545ded8e11621eae8f29467ff3352366), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb)]:
  - @vocab/core@0.0.7
  - @vocab/types@0.0.7

## 0.0.6

### Patch Changes

- [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab) [#27](https://github.com/seek-oss/vocab/pull/27) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add `ignore` config for ignoring files/folders from cli scripts

* [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab) [#27](https://github.com/seek-oss/vocab/pull/27) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Ignore node_modules from push, pull and compile scripts

* Updated dependencies [[`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab), [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab)]:
  - @vocab/core@0.0.6
  - @vocab/types@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [[`371ed16`](https://github.com/seek-oss/vocab/commit/371ed16a232a04dab13afa7e2b352dfb6724eea4), [`c222d68`](https://github.com/seek-oss/vocab/commit/c222d68a3c0c24723a338eccb959798881f6a118)]:
  - @vocab/core@0.0.5

## 0.0.4

### Patch Changes

- [`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2) [#19](https://github.com/seek-oss/vocab/pull/19) Thanks [@jahredhope](https://github.com/jahredhope)! - Compile useable TypeScript importable files with `vocab compile`.

  The new `vocab compile` step replaces `vocab generate-types` in creating a fully functional **translations.ts** file.

  This allows vocab to be used **without the Webpack Plugin**, however use of the plugin is still heavily advised to ensure optimal loading of translation content on the web.

  Support for unit testing is now better than ever! The newly created **translations.ts** means your unit test code will see the same code as available while rendering.

  See the [documentation](https://github.com/seek-oss/vocab) for further usage details.

* [`02f943c`](https://github.com/seek-oss/vocab/commit/02f943ca892913b41f9e4720a72400777cf14b3d) [#17](https://github.com/seek-oss/vocab/pull/17) Thanks [@jahredhope](https://github.com/jahredhope)! - Add additional debug traces

* Updated dependencies [[`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2), [`02f943c`](https://github.com/seek-oss/vocab/commit/02f943ca892913b41f9e4720a72400777cf14b3d)]:
  - @vocab/core@0.0.4
  - @vocab/types@0.0.5

## 0.0.3

### Patch Changes

- [`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e) [#14](https://github.com/seek-oss/vocab/pull/14) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add ability to override files namespace with \$namespace

* [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a) [#16](https://github.com/seek-oss/vocab/pull/16) Thanks [@jahredhope](https://github.com/jahredhope)! - Enable debugging with DEBUG environment variable

* Updated dependencies [[`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e), [`ed6cf40`](https://github.com/seek-oss/vocab/commit/ed6cf408973f2e9c4d07a71fcb52f40294ebaf65), [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a), [`b5a5a05`](https://github.com/seek-oss/vocab/commit/b5a5a05a5bb87b48e6e9160af75f555728143ea2)]:
  - @vocab/core@0.0.3
  - @vocab/types@0.0.4

## 0.0.2

### Patch Changes

- Updated dependencies [[`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b), [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b)]:
  - @vocab/types@0.0.3
  - @vocab/core@0.0.2

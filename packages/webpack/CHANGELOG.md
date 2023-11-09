# @vocab/webpack

## 1.2.4

### Patch Changes

- Updated dependencies [[`161d698`](https://github.com/seek-oss/vocab/commit/161d698f7fd198f594a765104f02261d2e45f007)]:
  - @vocab/core@1.5.0

## 1.2.3

### Patch Changes

- Updated dependencies [[`09b7179`](https://github.com/seek-oss/vocab/commit/09b7179f77311886e4c0e53ca85d2e260f51dd30)]:
  - @vocab/core@1.4.0

## 1.2.2

### Patch Changes

- Updated dependencies [[`4e3c2f9`](https://github.com/seek-oss/vocab/commit/4e3c2f96111ba3f85fa9f5277934a9b43e6fd639)]:
  - @vocab/core@1.3.1

## 1.2.1

### Patch Changes

- [`7c1adbc`](https://github.com/seek-oss/vocab/commit/7c1adbca046a3de08ed596f9c5fa6a2e46721bfa) [#141](https://github.com/seek-oss/vocab/pull/141) Thanks [@mrm007](https://github.com/mrm007)! - Generate virtual module code in the same format (ESM or CJS) as the translation file

## 1.2.0

### Minor Changes

- [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef) [#135](https://github.com/seek-oss/vocab/pull/135) Thanks [@mrm007](https://github.com/mrm007)! - Expose the compiled Vocab file regex as `compiledVocabFileFilter`

### Patch Changes

- [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef) [#135](https://github.com/seek-oss/vocab/pull/135) Thanks [@mrm007](https://github.com/mrm007)! - Include more file types in the compiled Vocab file regex (`.js`, `.cjs`, `.mjs`)

- Updated dependencies [[`16853dd`](https://github.com/seek-oss/vocab/commit/16853dd68f62c66013fea287cc0dbeafaec46351), [`5822b5e`](https://github.com/seek-oss/vocab/commit/5822b5e820ab7bf29d283c1d1c0925eacb783c46), [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef)]:
  - @vocab/core@1.3.0

## 1.1.6

### Patch Changes

- [`2bac4f2`](https://github.com/seek-oss/vocab/commit/2bac4f2747cb2aa6b41bdac6448753f321df6cf2) [#130](https://github.com/seek-oss/vocab/pull/130) Thanks [@mrm007](https://github.com/mrm007)! - Correctly resolve virtual resource loader path on Windows

## 1.1.5

### Patch Changes

- Updated dependencies [[`ec98685`](https://github.com/seek-oss/vocab/commit/ec98685f9bc0f609a750137ca8a2793552dfabed), [`ec98685`](https://github.com/seek-oss/vocab/commit/ec98685f9bc0f609a750137ca8a2793552dfabed)]:
  - @vocab/core@1.2.5

## 1.1.4

### Patch Changes

- Updated dependencies [[`a4944b0`](https://github.com/seek-oss/vocab/commit/a4944b062fc23296116f73c1c37fdd4f4be07ef6)]:
  - @vocab/core@1.2.4

## 1.1.3

### Patch Changes

- [`c3c5a05`](https://github.com/seek-oss/vocab/commit/c3c5a056159ff57fca7c9d47c9565785c42490bf) [#104](https://github.com/seek-oss/vocab/pull/104) Thanks [@askoufis](https://github.com/askoufis)! - Remove dependency on `json-loader`, resolve `virtual-resource-loader` before using it in the vocab loader

## 1.1.2

### Patch Changes

- [`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f) [#99](https://github.com/seek-oss/vocab/pull/99) Thanks [@askoufis](https://github.com/askoufis)! - Exclude source files from package build

- Updated dependencies [[`30d643d`](https://github.com/seek-oss/vocab/commit/30d643d4f1e7034a862b10c9764fa9bb31251b80), [`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f)]:
  - @vocab/core@1.2.0
  - @vocab/types@1.1.2
  - virtual-resource-loader@1.0.1

## 1.1.1

### Patch Changes

- [`09a698a`](https://github.com/seek-oss/vocab/commit/09a698af6aff86a851e4f829916b8f1f6beaca58) [#89](https://github.com/seek-oss/vocab/pull/89) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Add exports to packages with multiple entry points. This fixes
  `ERR_UNSUPPORTED_DIR_IMPORT` issues e.g. with NextJS or other setups, which
  rely on the new node resolver when using ESM packages.
- Updated dependencies [[`09a698a`](https://github.com/seek-oss/vocab/commit/09a698af6aff86a851e4f829916b8f1f6beaca58)]:
  - @vocab/core@1.1.1

## 1.1.0

### Minor Changes

- [`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd) [#80](https://github.com/seek-oss/vocab/pull/80) Thanks [@askoufis](https://github.com/askoufis)! - Enable the creation of generated languages via the `generatedLanguages` config.
  See [the docs] for more information and examples.

  [the docs]: https://github.com/seek-oss/vocab#generated-languages

### Patch Changes

- Updated dependencies [[`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd)]:
  - @vocab/core@1.1.0
  - @vocab/types@1.1.0

## 1.0.3

### Patch Changes

- [`3751301`](https://github.com/seek-oss/vocab/commit/37513013d869d6813c20d9ae9d53ac1fe2be2629) [#68](https://github.com/seek-oss/vocab/pull/68) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Remove compiler target warning

## 1.0.2

### Patch Changes

- [`304f404`](https://github.com/seek-oss/vocab/commit/304f404e812c4e7459e5d111612db69d42c6b376) [#67](https://github.com/seek-oss/vocab/pull/67) Thanks [@jahredhope](https://github.com/jahredhope)! - Provide additional information when Plugin is applied to incorrect target

- Updated dependencies [[`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a)]:
  - @vocab/core@1.0.2
  - @vocab/types@1.0.1

## 1.0.1

### Patch Changes

- [`aeee7fa`](https://github.com/seek-oss/vocab/commit/aeee7fa4081b0d732d271ce39d5865c51160f546) [#57](https://github.com/seek-oss/vocab/pull/57) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Fix encoding when languages have special characters

## 1.0.0

### Major Changes

- [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c) [#51](https://github.com/seek-oss/vocab/pull/51) Thanks [@jahredhope](https://github.com/jahredhope)! - Release v1.0.0

  Release Vocab as v1.0.0 to signify a stable API and support future [semver versioning](https://semver.org/) releases.

  Vocab has seen a lot of iteration and changes since it was first published on 20 November 2020. We are now confident with the API and believe Vocab is ready for common use.

### Patch Changes

- [`102556f`](https://github.com/seek-oss/vocab/commit/102556ff5ddae4d6f031e6ea6d119b12259b0a97) [#49](https://github.com/seek-oss/vocab/pull/49) Thanks [@jahredhope](https://github.com/jahredhope)! - Change VocabWebpackPlugin to a named export

* [`d62f256`](https://github.com/seek-oss/vocab/commit/d62f2564cd33d9a206984786701575d2a2690fae) [#53](https://github.com/seek-oss/vocab/pull/53) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Update `@vocab/unloader` usage to new `virtual-resource-loader`

* Updated dependencies [[`0074382`](https://github.com/seek-oss/vocab/commit/007438273ef70f5d5ded45777933651ad8df36f6), [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c)]:
  - @vocab/core@1.0.0
  - @vocab/types@1.0.0

## 0.0.19

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
  - @vocab/core@0.0.11
  - @vocab/types@0.0.9

## 0.0.18

### Patch Changes

- Updated dependencies [[`7c96a14`](https://github.com/seek-oss/vocab/commit/7c96a142f602132d38c1df1a47a1f4657dc5c94c)]:
  - @vocab/core@0.0.10

## 0.0.17

### Patch Changes

- Updated dependencies [[`3034bd3`](https://github.com/seek-oss/vocab/commit/3034bd3de610a9d1f3bfbd8caefa27064dee2710), [`c110745`](https://github.com/seek-oss/vocab/commit/c110745b79df1a8ade6b1d8a49e798b04a7b95e1)]:
  - @vocab/core@0.0.9

## 0.0.16

### Patch Changes

- [`3d4fa18`](https://github.com/seek-oss/vocab/commit/3d4fa18b2b8c8f640d778ba30603df323a563a38) [#37](https://github.com/seek-oss/vocab/pull/37) Thanks [@jahredhope](https://github.com/jahredhope)! - Apply loader to all vocab translation index files

* [`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d) [#36](https://github.com/seek-oss/vocab/pull/36) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support custom locales for ICU message parsing

* Updated dependencies [[`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d)]:
  - @vocab/core@0.0.8
  - @vocab/types@0.0.8

## 0.0.15

### Patch Changes

- [`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245) [#33](https://github.com/seek-oss/vocab/pull/33) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Move all vocab files to single directory with configurable suffix

* [`ad0d240`](https://github.com/seek-oss/vocab/commit/ad0d2404545ded8e11621eae8f29467ff3352366) [#31](https://github.com/seek-oss/vocab/pull/31) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Move the node runtime from @vocab/webpack to @vocab/core

* Updated dependencies [[`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245), [`ad0d240`](https://github.com/seek-oss/vocab/commit/ad0d2404545ded8e11621eae8f29467ff3352366), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb)]:
  - @vocab/core@0.0.7
  - @vocab/types@0.0.7

## 0.0.14

### Patch Changes

- [`80f85e9`](https://github.com/seek-oss/vocab/commit/80f85e9c45051da233a3edae062d8af6d7ca50e5) [#29](https://github.com/seek-oss/vocab/pull/29) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Fix mismatched file hashes across systems

## 0.0.13

### Patch Changes

- Updated dependencies [[`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab), [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab)]:
  - @vocab/core@0.0.6
  - @vocab/types@0.0.6

## 0.0.12

### Patch Changes

- [`3504706`](https://github.com/seek-oss/vocab/commit/35047069de334f62986518ff0be1bc3a08cc644f) [#20](https://github.com/seek-oss/vocab/pull/20) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Remove unnecessary webpack dependecies on alt language files

- Updated dependencies [[`371ed16`](https://github.com/seek-oss/vocab/commit/371ed16a232a04dab13afa7e2b352dfb6724eea4), [`c222d68`](https://github.com/seek-oss/vocab/commit/c222d68a3c0c24723a338eccb959798881f6a118)]:
  - @vocab/core@0.0.5

## 0.0.11

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

## 0.0.10

### Patch Changes

- [`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e) [#14](https://github.com/seek-oss/vocab/pull/14) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Only add neccesary data to translation build output

* [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a) [#16](https://github.com/seek-oss/vocab/pull/16) Thanks [@jahredhope](https://github.com/jahredhope)! - Enable debugging with DEBUG environment variable

- [`e4b5faa`](https://github.com/seek-oss/vocab/commit/e4b5faacf1381892bcdb68ac3f0c178263d810aa) [#10](https://github.com/seek-oss/vocab/pull/10) Thanks [@jahredhope](https://github.com/jahredhope)! - Allow no parameters in Webpack plugin

- Updated dependencies [[`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e), [`ed6cf40`](https://github.com/seek-oss/vocab/commit/ed6cf408973f2e9c4d07a71fcb52f40294ebaf65), [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a), [`b5a5a05`](https://github.com/seek-oss/vocab/commit/b5a5a05a5bb87b48e6e9160af75f555728143ea2)]:
  - @vocab/core@0.0.3
  - @vocab/types@0.0.4

## 0.0.9

### Patch Changes

- [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b) [#8](https://github.com/seek-oss/vocab/pull/8) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Convert from webpack loader to plugin

  The plugin supports passing custom config options as well as resolving `vocab.config.js`.

- Updated dependencies [[`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b), [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b)]:
  - @vocab/types@0.0.3
  - @vocab/core@0.0.2

## 0.0.8

### Patch Changes

- Updated dependencies [[`2c7779f`](https://github.com/seek-oss/vocab/commit/2c7779f5384793af6a178f5ab4d56b6a9f09bc02)]:
  - @vocab/utils@0.0.6

## 0.0.7

### Patch Changes

- [`504a808`](https://github.com/seek-oss/vocab/commit/504a808d61f359336f3b2bd95f61cb051d98922f) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Ensure virtual file uniqueness

* [`f7b6b5c`](https://github.com/seek-oss/vocab/commit/f7b6b5c1cdb3f72bb0a3d0c5c7a3da844b2a1c87) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Fix language fallbacks

* Updated dependencies [[`f7b6b5c`](https://github.com/seek-oss/vocab/commit/f7b6b5c1cdb3f72bb0a3d0c5c7a3da844b2a1c87)]:
  - @vocab/utils@0.0.5

## 0.0.6

### Patch Changes

- [`4589bce`](https://github.com/seek-oss/vocab/commit/4589bce912b7a8fb869e1c3a65d0c4c417043faf) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support language fallbacks through `extends` config

* [`870a74b`](https://github.com/seek-oss/vocab/commit/870a74b9a15ec2cb493c3de526c599b24fd5830d) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support custom config file locations

* Updated dependencies [[`4589bce`](https://github.com/seek-oss/vocab/commit/4589bce912b7a8fb869e1c3a65d0c4c417043faf), [`215eeba`](https://github.com/seek-oss/vocab/commit/215eeba619260b349a39d99a79fc69503dba5ccf), [`bf36f86`](https://github.com/seek-oss/vocab/commit/bf36f86a74ced4f42271b2f8fb128e995bb8c849), [`870a74b`](https://github.com/seek-oss/vocab/commit/870a74b9a15ec2cb493c3de526c599b24fd5830d)]:
  - @vocab/utils@0.0.4

## 0.0.5

### Patch Changes

- Updated dependencies [[`6f2c084`](https://github.com/seek-oss/vocab/commit/6f2c08419ce5773c589901fafa7bec7a1c94d2a5)]:
  - @vocab/utils@0.0.3

## 0.0.4

### Patch Changes

- [`4e3d94f`](https://github.com/seek-oss/vocab/commit/4e3d94f2e63f669bb11c7f0e89b1da1d94def87e) Thanks [@jahredhope](https://github.com/jahredhope)! - Fix webpack returning error on success

## 0.0.3

### Patch Changes

- [`0830756`](https://github.com/seek-oss/vocab/commit/0830756273c9d53664815b487fa69989419f102b) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Fix runtime import path

## 0.0.2

### Patch Changes

- [`9f99ea7`](https://github.com/seek-oss/vocab/commit/9f99ea7c827ec4d7c21a485e17e3adbbd1c49319) Thanks [@jahredhope](https://github.com/jahredhope)! - Remove React as dependency and target node

- Updated dependencies [[`9f99ea7`](https://github.com/seek-oss/vocab/commit/9f99ea7c827ec4d7c21a485e17e3adbbd1c49319)]:
  - @vocab/types@0.0.2
  - @vocab/utils@0.0.2

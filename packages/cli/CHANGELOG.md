# @vocab/cli

## 1.1.0

### Minor Changes

- [`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd) [#80](https://github.com/seek-oss/vocab/pull/80) Thanks [@askoufis](https://github.com/askoufis)! - Enable the creation of generated languages via the `generatedLanguages` config.
  See [the docs] for more information and examples.

  [the docs]: https://github.com/seek-oss/vocab#generated-languages

### Patch Changes

- Updated dependencies [[`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd)]:
  - @vocab/core@1.1.0

## 1.0.1

### Patch Changes

- [`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a) [#63](https://github.com/seek-oss/vocab/pull/63) Thanks [@jahredhope](https://github.com/jahredhope)! - Migrate to new @formatjs/icu-messageformat-parser as intl-messageformat-parser has been deprecated

- Updated dependencies [[`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a)]:
  - @vocab/core@1.0.2

## 1.0.0

### Major Changes

- [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c) [#51](https://github.com/seek-oss/vocab/pull/51) Thanks [@jahredhope](https://github.com/jahredhope)! - Release v1.0.0

  Release Vocab as v1.0.0 to signify a stable API and support future [semver versioning](https://semver.org/) releases.

  Vocab has seen a lot of iteration and changes since it was first published on 20 November 2020. We are now confident with the API and believe Vocab is ready for common use.

### Patch Changes

- Updated dependencies [[`0074382`](https://github.com/seek-oss/vocab/commit/007438273ef70f5d5ded45777933651ad8df36f6), [`3031054`](https://github.com/seek-oss/vocab/commit/303105440851db6126f0606e1607745b27dd981c)]:
  - @vocab/core@1.0.0
  - @vocab/phrase@1.0.0

## 0.0.16

### Patch Changes

- Updated dependencies [[`5b1fdc0`](https://github.com/seek-oss/vocab/commit/5b1fdc019522b12e7ef94b2fec57b54a9310d41c)]:
  - @vocab/core@0.0.11
  - @vocab/phrase@0.0.11

## 0.0.15

### Patch Changes

- Updated dependencies [[`7c96a14`](https://github.com/seek-oss/vocab/commit/7c96a142f602132d38c1df1a47a1f4657dc5c94c)]:
  - @vocab/core@0.0.10
  - @vocab/phrase@0.0.10

## 0.0.14

### Patch Changes

- Updated dependencies [[`3034bd3`](https://github.com/seek-oss/vocab/commit/3034bd3de610a9d1f3bfbd8caefa27064dee2710), [`c110745`](https://github.com/seek-oss/vocab/commit/c110745b79df1a8ade6b1d8a49e798b04a7b95e1)]:
  - @vocab/core@0.0.9
  - @vocab/phrase@0.0.9

## 0.0.13

### Patch Changes

- Updated dependencies [[`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d)]:
  - @vocab/core@0.0.8
  - @vocab/phrase@0.0.8

## 0.0.12

### Patch Changes

- Updated dependencies [[`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245), [`ad0d240`](https://github.com/seek-oss/vocab/commit/ad0d2404545ded8e11621eae8f29467ff3352366), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb)]:
  - @vocab/core@0.0.7
  - @vocab/phrase@0.0.7

## 0.0.11

### Patch Changes

- Updated dependencies [[`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab), [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab)]:
  - @vocab/core@0.0.6
  - @vocab/phrase@0.0.6

## 0.0.10

### Patch Changes

- Updated dependencies [[`371ed16`](https://github.com/seek-oss/vocab/commit/371ed16a232a04dab13afa7e2b352dfb6724eea4), [`c222d68`](https://github.com/seek-oss/vocab/commit/c222d68a3c0c24723a338eccb959798881f6a118)]:
  - @vocab/core@0.0.5
  - @vocab/phrase@0.0.5

## 0.0.9

### Patch Changes

- [`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2) [#19](https://github.com/seek-oss/vocab/pull/19) Thanks [@jahredhope](https://github.com/jahredhope)! - Compile useable TypeScript importable files with `vocab compile`.

  The new `vocab compile` step replaces `vocab generate-types` in creating a fully functional **translations.ts** file.

  This allows vocab to be used **without the Webpack Plugin**, however use of the plugin is still heavily advised to ensure optimal loading of translation content on the web.

  Support for unit testing is now better than ever! The newly created **translations.ts** means your unit test code will see the same code as available while rendering.

  See the [documentation](https://github.com/seek-oss/vocab) for further usage details.

- Updated dependencies [[`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2), [`02f943c`](https://github.com/seek-oss/vocab/commit/02f943ca892913b41f9e4720a72400777cf14b3d)]:
  - @vocab/core@0.0.4
  - @vocab/phrase@0.0.4

## 0.0.8

### Patch Changes

- [`ed6cf40`](https://github.com/seek-oss/vocab/commit/ed6cf408973f2e9c4d07a71fcb52f40294ebaf65) [#13](https://github.com/seek-oss/vocab/pull/13) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add validation script for identifying missing keys

* [`b5a5a05`](https://github.com/seek-oss/vocab/commit/b5a5a05a5bb87b48e6e9160af75f555728143ea2) [#15](https://github.com/seek-oss/vocab/pull/15) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Added watch mode to generate-types

* Updated dependencies [[`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e), [`ed6cf40`](https://github.com/seek-oss/vocab/commit/ed6cf408973f2e9c4d07a71fcb52f40294ebaf65), [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a), [`b5a5a05`](https://github.com/seek-oss/vocab/commit/b5a5a05a5bb87b48e6e9160af75f555728143ea2)]:
  - @vocab/core@0.0.3
  - @vocab/phrase@0.0.3

## 0.0.7

### Patch Changes

- [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b) [#8](https://github.com/seek-oss/vocab/pull/8) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Infer `t` return type more intelligently

  The translate key function (`t`) will now infer the return type as ReactNode only when the tag syntax is used.

- Updated dependencies [[`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b)]:
  - @vocab/core@0.0.2
  - @vocab/phrase@0.0.2

## 0.0.6

### Patch Changes

- [`45c4fe2`](https://github.com/seek-oss/vocab/commit/45c4fe273c5157475cb03ca57db662956ad5cbc9) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Improved type definitions for `t` function

* [`33aeb0f`](https://github.com/seek-oss/vocab/commit/33aeb0f210687b8ce57417e963bba9db7c7cb4e3) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Respect prettier config for generated typescript declarations

* Updated dependencies [[`2c7779f`](https://github.com/seek-oss/vocab/commit/2c7779f5384793af6a178f5ab4d56b6a9f09bc02)]:
  - @vocab/utils@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [[`f7b6b5c`](https://github.com/seek-oss/vocab/commit/f7b6b5c1cdb3f72bb0a3d0c5c7a3da844b2a1c87)]:
  - @vocab/utils@0.0.5

## 0.0.4

### Patch Changes

- [`4589bce`](https://github.com/seek-oss/vocab/commit/4589bce912b7a8fb869e1c3a65d0c4c417043faf) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support language fallbacks through `extends` config

* [`bf36f86`](https://github.com/seek-oss/vocab/commit/bf36f86a74ced4f42271b2f8fb128e995bb8c849) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Use config location as CWD

- [`f41c8f6`](https://github.com/seek-oss/vocab/commit/f41c8f67d78994bc071aca6eb20ef63421be2e96) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Access TranslationFile type from @vocab/cli instead of @vocab/types

* [`870a74b`](https://github.com/seek-oss/vocab/commit/870a74b9a15ec2cb493c3de526c599b24fd5830d) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support custom config file locations

* Updated dependencies [[`4589bce`](https://github.com/seek-oss/vocab/commit/4589bce912b7a8fb869e1c3a65d0c4c417043faf), [`215eeba`](https://github.com/seek-oss/vocab/commit/215eeba619260b349a39d99a79fc69503dba5ccf), [`bf36f86`](https://github.com/seek-oss/vocab/commit/bf36f86a74ced4f42271b2f8fb128e995bb8c849), [`870a74b`](https://github.com/seek-oss/vocab/commit/870a74b9a15ec2cb493c3de526c599b24fd5830d)]:
  - @vocab/utils@0.0.4

## 0.0.3

### Patch Changes

- Updated dependencies [[`6f2c084`](https://github.com/seek-oss/vocab/commit/6f2c08419ce5773c589901fafa7bec7a1c94d2a5)]:
  - @vocab/utils@0.0.3

## 0.0.2

### Patch Changes

- [`9f99ea7`](https://github.com/seek-oss/vocab/commit/9f99ea7c827ec4d7c21a485e17e3adbbd1c49319) Thanks [@jahredhope](https://github.com/jahredhope)! - Remove React as dependency and target node

- Updated dependencies [[`9f99ea7`](https://github.com/seek-oss/vocab/commit/9f99ea7c827ec4d7c21a485e17e3adbbd1c49319)]:
  - @vocab/utils@0.0.2

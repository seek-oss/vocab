# @vocab/vite

## 0.3.8

### Patch Changes

- Updated dependencies [[`f4ad654`](https://github.com/seek-oss/vocab/commit/f4ad654d926d3a7cdf6a477bc609a804ac4bb37c)]:
  - @vocab/core@1.7.6

## 0.3.7

### Patch Changes

- Updated dependencies [[`5f5bdb5`](https://github.com/seek-oss/vocab/commit/5f5bdb5e323c0121491d923dcaae961c5ac3fe81)]:
  - @vocab/core@1.7.5

## 0.3.6

### Patch Changes

- Updated dependencies [[`710649f`](https://github.com/seek-oss/vocab/commit/710649fae726227701f51410d6050fd0c17d6e3f)]:
  - @vocab/core@1.7.4

## 0.3.5

### Patch Changes

- Updated dependencies [[`478c86e`](https://github.com/seek-oss/vocab/commit/478c86eedc99e461540f9b7fdfcabc6da27099c7), [`478c86e`](https://github.com/seek-oss/vocab/commit/478c86eedc99e461540f9b7fdfcabc6da27099c7)]:
  - @vocab/core@1.7.3

## 0.3.4

### Patch Changes

- Updated dependencies [[`6be1c6b`](https://github.com/seek-oss/vocab/commit/6be1c6b027a8f9471c1c9858c18d2750c2f33427)]:
  - @vocab/core@1.7.2

## 0.3.3

### Patch Changes

- Updated dependencies [[`e9d389b`](https://github.com/seek-oss/vocab/commit/e9d389b99aa8c6a93ad7464d5e6ea65e42851825)]:
  - @vocab/core@1.7.1

## 0.3.2

### Patch Changes

- [#351](https://github.com/seek-oss/vocab/pull/351) [`a5e9d25`](https://github.com/seek-oss/vocab/commit/a5e9d256be271a47457213cb4eee5499af629116) Thanks [@askoufis](https://github.com/askoufis)! - Deprecate `compiledVocabFileFilter`

  `compiledVocabFileFilter` has been deprecated. Please import it from `@vocab/core` instead.

  **MIGRATION GUIDE**:

  ```diff
  -import { compiledVocabFileFilter } from '@vocab/webpack';
  -import { compiledVocabFileFilter } from '@vocab/vite';
  +import { compiledVocabFileFilter } from '@vocab/core';
  ```

- Updated dependencies [[`a5e9d25`](https://github.com/seek-oss/vocab/commit/a5e9d256be271a47457213cb4eee5499af629116), [`a5e9d25`](https://github.com/seek-oss/vocab/commit/a5e9d256be271a47457213cb4eee5499af629116)]:
  - @vocab/core@1.7.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`265326e`](https://github.com/seek-oss/vocab/commit/265326e88d3b7348ac68b30579c13e5163624960)]:
  - @vocab/core@1.6.6

## 0.3.0

### Minor Changes

- [#332](https://github.com/seek-oss/vocab/pull/332) [`e6303ab`](https://github.com/seek-oss/vocab/commit/e6303ab94d8a927dd67438d51439ba04b808937b) Thanks [@askoufis](https://github.com/askoufis)! - Replace default plugin export with named `vitePluginVocab` export

  **BREAKING CHANGE**

  This package no longer provides a default export. You must now import the named export `vitePluginVocab` instead.

  **EXAMPLE USAGE**

  ```diff
  -import vitePluginVocab from '@vocab/vite';
  +import { vitePluginVocab } from '@vocab/vite';
  ```

### Patch Changes

- [#330](https://github.com/seek-oss/vocab/pull/330) [`f3a6e58`](https://github.com/seek-oss/vocab/commit/f3a6e58d06c2def3f6ca4fd613b6b671a43a9d69) Thanks [@askoufis](https://github.com/askoufis)! - Publish correct hybrid CJS/ESM bundles

  This package now correctly configures and bundles CJS and ESM code. No API changes have been made.

- Updated dependencies [[`3e123e4`](https://github.com/seek-oss/vocab/commit/3e123e4ba337356b205981294f1cbbf9e4943b6a), [`f3a6e58`](https://github.com/seek-oss/vocab/commit/f3a6e58d06c2def3f6ca4fd613b6b671a43a9d69)]:
  - @vocab/core@1.6.5

## 0.2.4

### Patch Changes

- [#322](https://github.com/seek-oss/vocab/pull/322) [`b05e90c`](https://github.com/seek-oss/vocab/commit/b05e90c21a379a66acd138feae8647b2331844b6) Thanks [@renovate](https://github.com/apps/renovate)! - Update `cjs-module-lexer` dependency to `^2.0.0`

## 0.2.3

### Patch Changes

- [#323](https://github.com/seek-oss/vocab/pull/323) [`6e999ad`](https://github.com/seek-oss/vocab/commit/6e999ad2ec404294b28cf63aa28e185943d8ec0a) Thanks [@williamlark](https://github.com/williamlark)! - Add support for `vite@^7.0.0`

## 0.2.2

### Patch Changes

- Updated dependencies [[`5444b6a`](https://github.com/seek-oss/vocab/commit/5444b6ae5c344033672d9ae20d72c3e32c1fc70d)]:
  - @vocab/core@1.6.4

## 0.2.1

### Patch Changes

- [#305](https://github.com/seek-oss/vocab/pull/305) [`0b7abee`](https://github.com/seek-oss/vocab/commit/0b7abee04c7ef5b25bf6f9e04a8d58a3f09748cc) Thanks [@DanDroryAu](https://github.com/DanDroryAu)! - `vite-plugin`: enforce `pre` in plugin execution.

- [#308](https://github.com/seek-oss/vocab/pull/308) [`ce183f9`](https://github.com/seek-oss/vocab/commit/ce183f961688b14056cdf87d9d4d769baf5b38df) Thanks [@askoufis](https://github.com/askoufis)! - Extend `vite` peer dependnecy range to include `^6.0.0`

## 0.2.0

### Minor Changes

- [#303](https://github.com/seek-oss/vocab/pull/303) [`02fe9cd`](https://github.com/seek-oss/vocab/commit/02fe9cd0908a8916c0279a24ac53670d950f5717) Thanks [@williamlark](https://github.com/williamlark)! - `vite`: Rename exports in the Vite plugin

  > Note: This is a breaking change if you used either of the exports below, however, since this plugin is still experimental it is being released as a minor change.

  ### Renamed exports

  Moves a few of the Vite plugin functions under different export paths for better organisation. The functions themselves have not changed, only their exported location.
  - `@vocab/vite/create-language` -> `@vocab/vite/runtime`
  - `@vocab/vite/create-vocab-chunks` -> `@vocab/vite/chunks`

  ### New function available

  A `getChunkName` function is now exported under `@vocab/vite/chunks`.

## 0.1.1

### Patch Changes

- [#301](https://github.com/seek-oss/vocab/pull/301) [`7288b1e`](https://github.com/seek-oss/vocab/commit/7288b1e7afbc81e3264daa9e302651cd052c9396) Thanks [@williamlark](https://github.com/williamlark)! - Releasing @vocab/vite in v0 to signify an experimental release

## 0.1.0

### Minor Changes

- [#300](https://github.com/seek-oss/vocab/pull/300) [`9376a53`](https://github.com/seek-oss/vocab/commit/9376a53727cbe36bf99f3678db6b93182dbe1b5d) Thanks [@williamlark](https://github.com/williamlark)! - `vite`: Vite plugin exclusive to non-ssr builds

  The Vocab Vite plugin now runs exclusively during build-time, and only when build.ssr: false

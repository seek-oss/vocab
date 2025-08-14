# @vocab/vite

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

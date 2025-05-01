# @vocab/vite

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

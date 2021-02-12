# @vocab/phrase

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

# @vocab/webpack

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

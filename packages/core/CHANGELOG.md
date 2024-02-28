# @vocab/core

## 1.6.1

### Patch Changes

- [#206](https://github.com/seek-oss/vocab/pull/206) [`79a1c13`](https://github.com/seek-oss/vocab/commit/79a1c13a95c3f7b985c0ed551a79fcbc7072ff95) Thanks [@askoufis](https://github.com/askoufis)! - Enable the `TranslationKeys` type to operate on a union of translations

  **EXAMPLE USAGE**

  ```tsx
  import { TranslationKeys } from '@vocab/core';
  import fooTranslations from './foo.vocab';
  import barTranslations from './bar.vocab';

  type FooBarTranslationKeys = TranslationKeys<
    typeof fooTranslations | typeof barTranslations
  >;
  ```

- [#206](https://github.com/seek-oss/vocab/pull/206) [`79a1c13`](https://github.com/seek-oss/vocab/commit/79a1c13a95c3f7b985c0ed551a79fcbc7072ff95) Thanks [@askoufis](https://github.com/askoufis)! - Add documentation to the `TranslationKeys` type

## 1.6.0

### Minor Changes

- [#176](https://github.com/seek-oss/vocab/pull/176) [`8228608`](https://github.com/seek-oss/vocab/commit/8228608a1c8bd2f1de0ac65401cad447b30fc0a8) Thanks [@rstacruz](https://github.com/rstacruz)! - Add support for a alternative config file name, `vocab.config.cjs`

## 1.5.0

### Minor Changes

- [`161d698`](https://github.com/seek-oss/vocab/commit/161d698f7fd198f594a765104f02261d2e45f007) [#170](https://github.com/seek-oss/vocab/pull/170) Thanks [@jasoncheng-jora](https://github.com/jasoncheng-jora)! - `vocab push` and `vocab pull` can support global keys mapping. When you want certain translations to use a specific/custom key in Phrase, add the `globalKey` to the structure.

  **EXAMPLE USAGE**:

  ```jsonc
  // translations.json
  {
    "Hello": {
      "message": "Hello",
      "globalKey": "hello"
    },
    "Goodbye": {
      "message": "Goodbye",
      "globalKey": "app.goodbye.label"
    }
  }
  ```

  In the above example,

  - `vocab push` will push the `hello` and `app.goodbye.label` keys to Phrase.
  - `vocab pull` will pull translations from Phrase and map them to the `hello` and `app.goodbye.label` keys.

## 1.4.0

### Minor Changes

- [`09b7179`](https://github.com/seek-oss/vocab/commit/09b7179f77311886e4c0e53ca85d2e260f51dd30) [#154](https://github.com/seek-oss/vocab/pull/154) Thanks [@askoufis](https://github.com/askoufis)! - Add `TranslationKeys` type

  The `TranslationKeys` type can be used to get a string literal union of all the translation keys used in a translation file.

  **EXAMPLE USAGE**

  ```jsonc
  // .vocab/en.translations.json
  {
    "Hello": {
      "message": "Hello"
    },
    "Goodbye": {
      "message": "Goodbye"
    }
  }
  ```

  After running `vocab compile`:

  ```tsx
  import type { TranslationKeys } from '@vocab/core';
  import translations from './.vocab';

  // 'Hello' | 'Goodbye'
  type Keys = TranslationKeys<typeof translations>;
  ```

## 1.3.1

### Patch Changes

- [`4e3c2f9`](https://github.com/seek-oss/vocab/commit/4e3c2f96111ba3f85fa9f5277934a9b43e6fd639) [#146](https://github.com/seek-oss/vocab/pull/146) Thanks [@askoufis](https://github.com/askoufis)! - Fix generated types when a tag is inside a plural argument

## 1.3.0

### Minor Changes

- [`16853dd`](https://github.com/seek-oss/vocab/commit/16853dd68f62c66013fea287cc0dbeafaec46351) [#137](https://github.com/seek-oss/vocab/pull/137) Thanks [@mrm007](https://github.com/mrm007)! - Absorb types into `@vocab/core`

  `@vocab/types` re-exports all types from `@vocab/core` and will be deprecated and removed in the near future.

### Patch Changes

- [`5822b5e`](https://github.com/seek-oss/vocab/commit/5822b5e820ab7bf29d283c1d1c0925eacb783c46) [#139](https://github.com/seek-oss/vocab/pull/139) Thanks [@mrm007](https://github.com/mrm007)! - Use the correct return types in the generated translations

- [`ca27748`](https://github.com/seek-oss/vocab/commit/ca27748e044fde10617e8bf4358480706583c1ef) [#135](https://github.com/seek-oss/vocab/pull/135) Thanks [@mrm007](https://github.com/mrm007)! - Use `import type` syntax in the generated translation file

## 1.2.5

### Patch Changes

- [`ec98685`](https://github.com/seek-oss/vocab/commit/ec98685f9bc0f609a750137ca8a2793552dfabed) [#129](https://github.com/seek-oss/vocab/pull/129) Thanks [@askoufis](https://github.com/askoufis)! - Sort compiled translation imports

- [`ec98685`](https://github.com/seek-oss/vocab/commit/ec98685f9bc0f609a750137ca8a2793552dfabed) [#129](https://github.com/seek-oss/vocab/pull/129) Thanks [@askoufis](https://github.com/askoufis)! - Fix a bug where an empty import could be generated in compiled translations

## 1.2.4

### Patch Changes

- [`a4944b0`](https://github.com/seek-oss/vocab/commit/a4944b062fc23296116f73c1c37fdd4f4be07ef6) [#126](https://github.com/seek-oss/vocab/pull/126) Thanks [@askoufis](https://github.com/askoufis)! - Fix compiled type for self-referential parameters

  `plural`, `select` and `selectOrdinal` parameters can reference themselves in their own match clauses.
  In most cases, it's recommended to use the special `#` token to reference the input parameter.
  Using the `#` token can enhance readability in long messages, and it makes renaming a parameter much quicker, since you only need to change the parameter name in one place.

  For example:

  ```jsonc
  {
    "I have numCats cats": {
      "message": "I have {numCats, plural, one {# cat} other {# cats}}"
    }
  }
  ```

  You can however use the parameter name directly if you want to:

  ```jsonc
  {
    "I have numCats cats": {
      // This message is equivalent to the message in the previous example
      "message": "I have {numCats, plural, one {{numCats} cat} other {{numCats} cats}}"
    }
  }
  ```

  In the above example, a bug in Vocab caused an incorrect type to be assigned to the `numCats` parameter:

  ```ts
  // Type Error: Type 'number' is not assignable to type 'string'
  // `numCats` should be of type `number`, but is instead of type `string`
  t('I have numCats cats', { numCats: 3 });
  ```

  Vocab now generates the correct type in this case.

## 1.2.3

### Patch Changes

- [`fa1d81f`](https://github.com/seek-oss/vocab/commit/fa1d81fb716928a822985e2193bf98ebd422009f) [#121](https://github.com/seek-oss/vocab/pull/121) Thanks [@askoufis](https://github.com/askoufis)! - Add `StringWithSuggestions` utility type

  This type is equivalent to the `string` type, but it tricks the language server into providing suggestions for string literals passed into the `Suggestions` generic parameter.

  **EXAMPLE USAGE**:

  ```ts
  type AnyAnimal = StringWithSuggestions<'cat' | 'dog'>;
  // Suggests cat and dog, but accepts any string
  const animal: AnyAnimal = '';
  ```

- Updated dependencies [[`fa1d81f`](https://github.com/seek-oss/vocab/commit/fa1d81fb716928a822985e2193bf98ebd422009f)]:
  - @vocab/types@1.2.0

## 1.2.2

### Patch Changes

- [`ec718fe`](https://github.com/seek-oss/vocab/commit/ec718fef3d0212a9fa84c45c04aa891f662a6b3d) [#119](https://github.com/seek-oss/vocab/pull/119) Thanks [@askoufis](https://github.com/askoufis)! - Fix compiled type for `select` parameter

  Vocab uses [`intl-messageformat`][intl-messageformat] to parse and derive types for ICU translation messages.
  By default this parser enforces that `select` (and `plural`) arguments _must_ contain an `other` clause as a fallthrough.
  Vocab does not deviate from this default, but it was previously deriving the type of [select type arguments] as a string literal union of all possible match cases:

  ```json
  {
    "My message": {
      "message": "{param, select, foo {foo} bar {bar} other {baz}}"
    }
  }
  ```

  ```ts
  // Type Error: `param` is not of type 'foo' | 'bar' | 'other'
  t('My message', { param: 'something else' });
  ```

  This is incorrect, as the `other` clause is a fallthrough for values other than `foo` or `bar`.
  Vocab will now derive the type of these arguments as `StringWithSuggestions<Suggestions>`.
  This type is equivalent to `string`, but it enables your IDE to provide suggestions for explicit matches.

  ```ts
  // `param` can be any string, but "foo" and "bar" will be suggested
  t('My message', { param: '' });
  ```

  [intl-messageformat]: https://www.npmjs.com/package/intl-messageformat
  [select type arguments]: https://formatjs.io/docs/core-concepts/icu-syntax/#select-format

## 1.2.1

### Patch Changes

- [`673b16c`](https://github.com/seek-oss/vocab/commit/673b16c4c4d94a70b0799294b083c829abbc73fc) [#117](https://github.com/seek-oss/vocab/pull/117) Thanks [@askoufis](https://github.com/askoufis)! - Deeply parse nested arguments inside `plural` arguments

  ICU [plural type arguments] can contain arguments in their matches:

  ```json
  {
    "My message": {
      "message": "{numThings, plural, one {{foo} singular} other {{bar} plural}}"
    }
  }
  ```

  These were being parsed incorrectly, resulting in only the top-level plural argument being output in the compiled message type:

  ```ts
  // Type error: `foo` and `bar` are not valid arguments
  t('My message', { numThings: 1, foo: 'foo', bar: 'bar' });
  ```

  These arguments are now correctly parsed resulting in a correctly typed message:

  ```ts
  // Works!
  t('My message', { numThings: 1, foo: 'foo', bar: 'bar' });
  ```

  [plural type arguments]: https://formatjs.io/docs/core-concepts/icu-syntax/#plural-format

## 1.2.0

### Minor Changes

- [`30d643d`](https://github.com/seek-oss/vocab/commit/30d643d4f1e7034a862b10c9764fa9bb31251b80) [#101](https://github.com/seek-oss/vocab/pull/101) Thanks [@askoufis](https://github.com/askoufis)! - `loadTranslation`, `loadAllTranslations`: Support loading translations with or without tags

  [Tags] can be conditionally loaded alongside translations by specifying the appropriate `withTags` value.
  By default, tags will not be loaded. Tags will also never be loaded for non-dev languages.

  **EXAMPLE USAGE**:

  ```tsx
  import type { UserConfig } from '@vocab/types';
  import { loadTranslation, loadAllTranslations } from '@vocab/core';

  const userConfig: UserConfig = {
    devLanguage: 'en',
    languages: [{ name: 'en' }, { name: 'th' }],
  };

  const translations = loadTranslation(
    {
      filePath: '/path/to/translations.json',
      fallbacks: 'valid',
      withTags: true,
    },
    userConfig,
  );

  const allTranslations = loadAllTranslations(
    { fallbacks: 'valid', includeNodeModules: false, withTags: true },
    userConfig,
  );
  ```

  [tags]: https://github.com/seek-oss/vocab#tags

### Patch Changes

- Updated dependencies [[`fc74024`](https://github.com/seek-oss/vocab/commit/fc74024a375b442f77d0e32aeb4a188a0315a52f)]:
  - @vocab/types@1.1.2

## 1.1.2

### Patch Changes

- [`e5a066c`](https://github.com/seek-oss/vocab/commit/e5a066c8a7539a62a9c1c4d813aa87461ba43cdc) [#96](https://github.com/seek-oss/vocab/pull/96) Thanks [@askoufis](https://github.com/askoufis)! - Update `intl-messageformat` dependencies

- Updated dependencies [[`e5a066c`](https://github.com/seek-oss/vocab/commit/e5a066c8a7539a62a9c1c4d813aa87461ba43cdc)]:
  - @vocab/types@1.1.1

## 1.1.1

### Patch Changes

- [`09a698a`](https://github.com/seek-oss/vocab/commit/09a698af6aff86a851e4f829916b8f1f6beaca58) [#89](https://github.com/seek-oss/vocab/pull/89) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Add exports to packages with multiple entry points. This fixes
  `ERR_UNSUPPORTED_DIR_IMPORT` issues e.g. with NextJS or other setups, which
  rely on the new node resolver when using ESM packages.

## 1.1.0

### Minor Changes

- [`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd) [#80](https://github.com/seek-oss/vocab/pull/80) Thanks [@askoufis](https://github.com/askoufis)! - Enable the creation of generated languages via the `generatedLanguages` config.
  See [the docs] for more information and examples.

  [the docs]: https://github.com/seek-oss/vocab#generated-languages

### Patch Changes

- Updated dependencies [[`87333d7`](https://github.com/seek-oss/vocab/commit/87333d79c4a883b07d7d8f2c272b16e2243c49bd)]:
  - @vocab/types@1.1.0

## 1.0.4

### Patch Changes

- [`206c0fa`](https://github.com/seek-oss/vocab/commit/206c0fa36b05f23da593ebed801197c523477af6) [#78](https://github.com/seek-oss/vocab/pull/78) Thanks [@askoufis](https://github.com/askoufis)! - Fix incorrect language hierarchy when an extended language extends another language

## 1.0.3

### Patch Changes

- [`78e874f`](https://github.com/seek-oss/vocab/commit/78e874f720ca34d771072c09fe55b57ff3158e02) [#71](https://github.com/seek-oss/vocab/pull/71) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Only write compiled runtime files to disk if they have been changed

## 1.0.2

### Patch Changes

- [`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a) [#63](https://github.com/seek-oss/vocab/pull/63) Thanks [@jahredhope](https://github.com/jahredhope)! - Migrate to new @formatjs/icu-messageformat-parser as intl-messageformat-parser has been deprecated

- Updated dependencies [[`3ec6dba`](https://github.com/seek-oss/vocab/commit/3ec6dbaad590299cc33e2d9d4a877576eb05853a)]:
  - @vocab/types@1.0.1

## 1.0.1

### Patch Changes

- [`c9a38dd`](https://github.com/seek-oss/vocab/commit/c9a38dd15e2c2a47fc4d5eb2348fdd08a6982768) [#54](https://github.com/seek-oss/vocab/pull/54) Thanks [@jahredhope](https://github.com/jahredhope)! - Allow special characters within translation keys and messages

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

## 0.0.11

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

## 0.0.10

### Patch Changes

- [`7c96a14`](https://github.com/seek-oss/vocab/commit/7c96a142f602132d38c1df1a47a1f4657dc5c94c) [#43](https://github.com/seek-oss/vocab/pull/43) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Return `NonNullable<ReactNode>` instead of `ReactNode` from translation function

## 0.0.9

### Patch Changes

- [`3034bd3`](https://github.com/seek-oss/vocab/commit/3034bd3de610a9d1f3bfbd8caefa27064dee2710) [#40](https://github.com/seek-oss/vocab/pull/40) Thanks [@jahredhope](https://github.com/jahredhope)! - Fix .vocab files with no prefix not compiling

* [`c110745`](https://github.com/seek-oss/vocab/commit/c110745b79df1a8ade6b1d8a49e798b04a7b95e1) [#42](https://github.com/seek-oss/vocab/pull/42) Thanks [@jahredhope](https://github.com/jahredhope)! - Avoid overriding existing translations files for new directories

## 0.0.8

### Patch Changes

- [`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d) [#36](https://github.com/seek-oss/vocab/pull/36) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Support custom locales for ICU message parsing

- Updated dependencies [[`f2fca67`](https://github.com/seek-oss/vocab/commit/f2fca679c66ae65405a0aa24f0a0e472026aad0d)]:
  - @vocab/types@0.0.8

## 0.0.7

### Patch Changes

- [`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245) [#33](https://github.com/seek-oss/vocab/pull/33) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Move all vocab files to single directory with configurable suffix

* [`ad0d240`](https://github.com/seek-oss/vocab/commit/ad0d2404545ded8e11621eae8f29467ff3352366) [#31](https://github.com/seek-oss/vocab/pull/31) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Move the node runtime from @vocab/webpack to @vocab/core

- [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb) [#34](https://github.com/seek-oss/vocab/pull/34) Thanks [@jahredhope](https://github.com/jahredhope)! - Create translation files for newly created vocab directories

* [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb) [#34](https://github.com/seek-oss/vocab/pull/34) Thanks [@jahredhope](https://github.com/jahredhope)! - Validate translation files as loaded. Providing additional error messaging.

* Updated dependencies [[`283bcad`](https://github.com/seek-oss/vocab/commit/283bcada06e622ab14ed891743ed3f55cf09e245), [`f3992ef`](https://github.com/seek-oss/vocab/commit/f3992efbf08939ebf853fac650a49cc46dc51dfb)]:
  - @vocab/types@0.0.7

## 0.0.6

### Patch Changes

- [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab) [#27](https://github.com/seek-oss/vocab/pull/27) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add `ignore` config for ignoring files/folders from cli scripts

* [`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab) [#27](https://github.com/seek-oss/vocab/pull/27) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Ignore node_modules from push, pull and compile scripts

* Updated dependencies [[`80a46c0`](https://github.com/seek-oss/vocab/commit/80a46c01a55408675f5822c3618519f80136c3ab)]:
  - @vocab/types@0.0.6

## 0.0.5

### Patch Changes

- [`371ed16`](https://github.com/seek-oss/vocab/commit/371ed16a232a04dab13afa7e2b352dfb6724eea4) [#25](https://github.com/seek-oss/vocab/pull/25) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Watch alt language files as well as dev language

* [`c222d68`](https://github.com/seek-oss/vocab/commit/c222d68a3c0c24723a338eccb959798881f6a118) [#24](https://github.com/seek-oss/vocab/pull/24) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Changed glob constants to functions

## 0.0.4

### Patch Changes

- [`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2) [#19](https://github.com/seek-oss/vocab/pull/19) Thanks [@jahredhope](https://github.com/jahredhope)! - Compile useable TypeScript importable files with `vocab compile`.

  The new `vocab compile` step replaces `vocab generate-types` in creating a fully functional **translations.ts** file.

  This allows vocab to be used **without the Webpack Plugin**, however use of the plugin is still heavily advised to ensure optimal loading of translation content on the web.

  Support for unit testing is now better than ever! The newly created **translations.ts** means your unit test code will see the same code as available while rendering.

  See the [documentation](https://github.com/seek-oss/vocab) for further usage details.

* [`02f943c`](https://github.com/seek-oss/vocab/commit/02f943ca892913b41f9e4720a72400777cf14b3d) [#17](https://github.com/seek-oss/vocab/pull/17) Thanks [@jahredhope](https://github.com/jahredhope)! - Add additional debug traces

* Updated dependencies [[`5f5c581`](https://github.com/seek-oss/vocab/commit/5f5c581a65bff28729ee19e1ec0bdea488a9d6c2)]:
  - @vocab/types@0.0.5

## 0.0.3

### Patch Changes

- [`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e) [#14](https://github.com/seek-oss/vocab/pull/14) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add ability to override files namespace with \$namespace

* [`ed6cf40`](https://github.com/seek-oss/vocab/commit/ed6cf408973f2e9c4d07a71fcb52f40294ebaf65) [#13](https://github.com/seek-oss/vocab/pull/13) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Add validation script for identifying missing keys

- [`26b52f4`](https://github.com/seek-oss/vocab/commit/26b52f4878ded440841e08c858bdc9e685500c2a) [#16](https://github.com/seek-oss/vocab/pull/16) Thanks [@jahredhope](https://github.com/jahredhope)! - Enable debugging with DEBUG environment variable

* [`b5a5a05`](https://github.com/seek-oss/vocab/commit/b5a5a05a5bb87b48e6e9160af75f555728143ea2) [#15](https://github.com/seek-oss/vocab/pull/15) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Added watch mode to generate-types

* Updated dependencies [[`08de30d`](https://github.com/seek-oss/vocab/commit/08de30d338c2a5ebdcf14da7c736dddf22e7ca9e)]:
  - @vocab/types@0.0.4

## 0.0.2

### Patch Changes

- [`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b) [#8](https://github.com/seek-oss/vocab/pull/8) Thanks [@mattcompiles](https://github.com/mattcompiles)! - Infer `t` return type more intelligently

  The translate key function (`t`) will now infer the return type as ReactNode only when the tag syntax is used.

- Updated dependencies [[`4710f34`](https://github.com/seek-oss/vocab/commit/4710f341f2827643e3eff69ef7e26d44ec6e8a2b)]:
  - @vocab/types@0.0.3

# Vocab

Vocab is a strongly typed internationalization framework for React.

Vocab helps you ship multiple languages without compromising the reliability of your site or slowing down delivery.

- **Shareable translations**\
  Translations are co-located with the components that use them. Vocab uses the module graph allowing shared components to be installed with package managers like npm, just like any other module.

- **Loading translations dynamically**\
  Vocab only loads the current user's language. If the language changes Vocab can load the new language behind the scenes without reloading the page.

- **Strongly typed with TypeScript**\
  When using translations TypeScript will ensure code only accesses valid translations and translations are passed all required dynamic values.

## Table of contents

- [Getting started](#getting-started)
  - [Step 1: Install Dependencies](#step-1-install-dependencies)
  - [Step 2: Configure Vocab](#step-2-configure-vocab)
  - [Step 3: Set the language using the React Provider](#step-3-set-the-language-using-the-react-provider)
  - [Step 4: Create translations](#step-4-create-translations)
  - [Step 5: Compile and consume translations](#step-5-compile-and-consume-translations)
  - [Step 6: [Optional] Set up plugin](#step-6-optional-set-up-plugin)
  - [Step 7: [Optional] Optimize for fast page loading](#step-7-optional-optimize-for-fast-page-loading)

## Getting started

### Step 1: Install Dependencies

Vocab is a monorepo containing different packages you can install depending on your usage.
The below list will get you started using the CLI and React integration.

```sh
npm install --save-dev @vocab/cli
npm install --save @vocab/core @vocab/react
```

### Step 2: Configure Vocab

You can configure Vocab directly when calling the API, or via a `vocab.config.js` or `vocab.config.cjs` file.

> [!TIP]  
> It's a good idea to name your languages using [IETF language tags], however this is not a requirement.

In this example we've configured two languages named `en` (English) and `fr` (French).
We've also configured a `devLanguage` of `en`.
This is the language Vocab will assume when it sees a `translation.json` file without a language prefix.

```js
// vocab.config.js
module.exports = {
  languages: [{ name: 'en' }, { name: 'fr' }],
  devLanguage: 'en'
};
```

See the [configuration] section for more configuration options.

[IETF language tags]: https://en.wikipedia.org/wiki/IETF_language_tag
[configuration]: #configuration

### Step 3: Set the language using the React Provider

Vocab uses React's context API to provide information for your translation lookups.
To tell Vocab which language to use, wrap your app in a `VocabProvider` component and pass in a `language` prop corresponding to one of the language names configured in your `vocab.config.js` file.

> [!NOTE]
> Using methods discussed later we'll make sure the first language is loaded on page load.
> However, after this, changing languages may lead to a period of no translations as Vocab downloads the new language's translations.

```tsx
// src/App.tsx

import { VocabProvider } from '@vocab/react';

const App = ({ children }) => {
  return (
    <VocabProvider language="en">{children}</VocabProvider>
  );
};
```

If you need to customize the locale for your language, you can pass a `locale` prop to the `VocabProvider` component.
This tells Vocab which locale to use when formatting your translations.

```tsx
// src/App.tsx

import { VocabProvider } from '@vocab/react';

function App({ children }) {
  return (
    <VocabProvider language="myCustomLanguage" locale="en">
      {children}
    </VocabProvider>
  );
}
```

See [here][overriding the locale] for more information on how and when to use the `locale` prop.

[overriding the locale]: #overriding-the-locale

### Step 4: Create translations

A translation file is a JSON file consisting of a flat structure of keys.
Each key must contain a `message` property, and optionally a `description` property.

Rather than creating one giant file for each language's translations, Vocab enables you to co-locate the translations alongside their consuming components.
To facilitate this, Vocab lets you group translations inside folders ending in `.vocab`.
You may have as many of these folders as you like in your project.

> [!TIP]
> Your folders can be named anything, as long as it ends in `.vocab`.
> It's recommened to just name your folders `.vocab` so you have one less name to think of/rename in the future.

Translation files must follow the naming pattern of `{languageName}.translations.json`.
The exception to this is translations for your `devLanguage` which must be placed in a file named `translations.json`.

In the following examples, we're defining translations for our `devLanguage`, and a language named `fr`.

```jsonc
// src/MyComponent/.vocab/translations.json

{
  "my key": {
    "message": "Hello from Vocab",
    "description": "An optional description to help when translating"
  }
}
```

```jsonc
// src/MyComponent/.vocab/fr.translations.json

{
  "my key": {
    "message": "Bonjour de Vocab",
    "description": "An optional description to help when translating"
  }
}
```

> [!NOTE]
> You can create your translation files manually.
> However, Vocab also offers integrations with remote translation platforms to push and pull translations automatically.
> See [External translation tooling] for more information.

[External translation tooling]: #external-translation-tooling

### Step 5: Compile and consume translations

Once you have created some translations, run `vocab compile`.
This command creates an `index.ts` file inside each folder ending in `.vocab`.
Importing this file provides type-safe translations for your React components.
Accessing translation messages is done by passing these imported translations to the `useTranslations` hook and using the returned `t` function.

```tsx
// src/MyComponent.tsx

import { useTranslations } from '@vocab/react';
import translations from './.vocab';

function MyComponent({ children }) {
  const { t } = useTranslations(translations);

  // t('my key') will return the appropriate translation based on the language set in your app's VocabProvider
  return <div>{t('my key')}</div>;
}
```

### Step 6: [Optional] Set up plugin

#### Webpack Plugin

With the default setup, every language is loaded into your web application all the time, potentially leading to a large bundle size.
Ideally you will want to switch out the Node.js/default runtime for the web runtime, which only loads the active language.

This is done using the `VocabWebpackPlugin`.
Applying this plugin to your client webpack configuration will replace all vocab files with dynamic asynchronous chunks designed for the web.

```sh
npm i --save-dev @vocab/webpack
```

```js
// webpack.config.js

const { VocabWebpackPlugin } = require('@vocab/webpack');

module.exports = {
  plugins: [new VocabWebpackPlugin()]
};
```

#### Vite Plugin _(this plugin is experimental)_

> [!NOTE]
> This plugin is still experimental and may not work in all cases. If you encounter any issues, please open an issue on the Vocab GitHub repository.

Vocab also provides a Vite plugin to handle the same functionality as the Webpack plugin.

```shell
npm i --save-dev @vocab/vite
```

default usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import { vocabPluginVite } from '@vocab/vite';
import vocabConfig from './vocab.config.cjs';

export default defineConfig({
  plugins: [
    vocabPluginVite({
      vocabConfig
    })
  ]
});
```

#### createVocabChunks

If you want to combine all language files into a single chunk, you can use the `createVocabChunks` function.
Simply use the function in your `manualChunks` configuration.

```js
// vite.config.js
import { defineConfig } from 'vite';
import { vocabPluginVite } from '@vocab/vite';
import { createVocabChunks } from '@vocab/vite/create-vocab-chunks';
import vocabConfig from './vocab.config.cjs';

export default defineConfig({
  plugins: [
    vocabPluginVite({
      vocabConfig
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id, ctx) => {
          // handle your own manual chunks before or after the vocab chunks.
          const languageChunkName = createVocabChunks(
            id,
            ctx
          );
          if (languageChunkName) {
            // vocab has found a language chunk. Either return it or handle it in your own way.
            return languageChunkName;
          }
        }
      }
    }
  }
});
```

#### VocabPluginOptions

```ts
type VocabPluginOptions = {
  /**
   * The Vocab configuration file.
   * The type can be found in the `@vocab/core/types`.
   * This value is required
   */
  vocabConfig: UserConfig;
};
```

### Step 7: [Optional] Optimize for fast page loading

Using the above method without optimizing what chunks webpack uses you may find the page needing to do an extra round trip to load languages on a page.

This is where `getChunkName` can be used to retrieve the Webpack chunk used for a specific language.

For example, here is a server render function that would add the current language chunk to [Loadable component's ChunkExtractor](https://loadable-components.com/docs/api-loadable-server/#chunkextractor).

```tsx
// src/render.tsx

import { getChunkName } from '@vocab/webpack/chunk-name';

// ...

const chunkName = getChunkName(language);

const extractor = new ChunkExtractor();

extractor.addChunk(chunkName);
```

## Dynamic Values in Translations

Translation messages can sometimes contain dynamic values, such as dates/times, links, usernames, etc.
These values often exist somewhere in the middle of a message, and could change location depending on the translation.
To support this, Vocab uses [Format.js's `intl-messageformat` library], which enables you to use [ICU Message syntax](https://formatjs.io/docs/core-concepts/icu-syntax/) in your messages.

In the below example we are defining two messages: one that accepts a single parameter, and one that accepts a component.

```json
{
  "my key with param": {
    "message": "Bonjour de {name}"
  },
  "my key with component": {
    "message": "Bonjour de <Link>Vocab</Link>"
  }
}
```

Vocab will automatically parse these strings as ICU messages and generate strict types for any parameters it finds.

```tsx
t('my key with param', { name: 'Vocab' });
t('my key with component', {
  Link: (children) => <a href="/foo">{children}</a>
});
```

[Format.js's `intl-messageformat` library]: https://formatjs.io/docs/intl-messageformat/

## Overriding the Locale

By default, your language name is passed as the `locale` to the formatting API provided by [`intl-messageformat`].
The `locale` is used to determine how to format dates, numbers, and other locale-sensitive values.
If you wish to customize this behaviour, you can pass a `locale` prop to the `VocabProvider` component.

```tsx
<VocabProvider language="myCustomLanguage" locale="th-TH">
  {children}
</VocabProvider>
```

This can be useful in certain situations:

- You have chosen to name your language something other than an [IETF language tag], but still want to use a specific locale for formatting
- You want to use a different locale for formatting a specific language.
  E.g. when formatting values for `th` (Thai) locales, the default calendar is Buddhist, but you may want to use the Gregorian calendar.
  This can be achieved by specifying a `locale` value with a BCP 47 extension sequence suffix such as `-u-ca-gregory`.
  For example: `th-u-ca-gregory`.
  See the [MDN Intl docs] for more information on BCP 47 extension sequences.

[`intl-messageformat`]: https://formatjs.io/docs/intl-messageformat/
[IETF language tag]: https://en.wikipedia.org/wiki/IETF_language_tag
[mdn intl docs]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument

## Accessing the Current `language` or `locale`

If you need to access either the `language` or `locale` that you passed to your `VocabProvider`, you can use the `useLanguage` hook:

```tsx
import { useLanguage } from '@vocab/react';

const MyComponent = () => {
  const { language, locale } = useLanguage();
  return (
    <div>
      {language} - {locale}
    </div>
  );
};
```

> [!CAUTION]\
> `locale` is only available when you pass a `locale` prop to your `VocabProvider`.
> If you don't pass a `locale` prop, `locale` will be `undefined`.
> It's generally advised to name your languages using [IETF language tags] and let Vocab handle the locale for you.
> This gives you the added benefit that you can use the `language` from `useLanguage` if necessary, and it will always be defined.

Typically you won't need to access these values since the ICU message syntax supports locale-aware formatting of [numbers], [dates, and times].
However, one use case where you might need to access these values is when formatting a currency value.
This is because there is currently no way to specify the currency for an ICU message programmatically, so it must be hardcoded within the messsage.
This poses a problem when you don't want to couple your translations to a specific currency.

```json
{
  "my key with currency": {
    "message": "You have {value, number, ::compact-short currency/GBP}"
  }
}
```

When given a `value` of `123`, the above message would render as `You have GBP 123`.

To format a value with a dynamic currency, you could use the `useLanguage` hook to access the current `language` and format the currency value using the `Intl.NumberFormat` API:

```tsx
const Currency = ({ value, currency }) => {
  const { language } = useLanguage();

  const formattedValue = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);

  return <div>{formattedValue}</div>;
};
```

[numbers]: https://formatjs.io/docs/core-concepts/icu-syntax/#number-type
[dates, and times]: https://formatjs.io/docs/core-concepts/icu-syntax/#supported-datetime-skeleton

## Configuration

Configuration can either be passed into the Node API directly or be gathered from the nearest `vocab.config.js` or `vocab.config.cjs` file.

```js
// vocab.config.js

function capitalize(element) {
  return element.toUpperCase();
}

function pad(message) {
  return '[' + message + ']';
}

module.exports = {
  devLanguage: 'en',
  languages: [
    { name: 'en' },
    { name: 'en-AU', extends: 'en' },
    { name: 'en-US', extends: 'en' },
    { name: 'fr-FR' }
  ],
  /**
   * An array of languages to generate based off translations for existing languages
   * Default: []
   */
  generatedLanguages: [
    {
      name: 'generatedLanguage',
      extends: 'en',
      generator: {
        transformElement: capitalize,
        transformMessage: pad
      }
    }
  ],
  /**
   * The root directory to compile and validate translations
   * Default: Current working directory
   */
  projectRoot: './example/',
  /**
   * A custom suffix to name vocab translation directories
   * Default: '.vocab'
   */
  translationsDirectorySuffix: '.vocab',
  /**
   * An array of glob paths to ignore from compilation and validation
   */
  ignore: ['**/ignored_directory/**']
};
```

## Translation Key Types

If you need to access the keys of your translations as a TypeScript type, you can use the `TranslationKeys` type from `@vocab/core`:

```jsonc
// translations.json
{
  "Hello": {
    "message": "Hello"
  },
  "Goodbye": {
    "message": "Goodbye"
  }
}
```

```ts
import type { TranslationKeys } from '@vocab/core';
import translations from './.vocab';

// "Hello" | "Goodbye"
type MyTranslationKeys = TranslationKeys<
  typeof translations
>;
```

## Generated languages

Vocab supports the creation of generated languages via the `generatedLanguages` config.

Generated languages are created by running a message `generator` over every translation message in an existing translation.
A `generator` may contain a `transformElement` function, a `transformMessage` function, or both.
Both of these functions accept a single string parameter and return a string.

`transformElement` is applied to string literal values contained within `MessageFormatElement`s.
A `MessageFormatElement` is an object representing a node in the AST of a compiled translation message.
Simply put, any text that would end up being translated by a translator, i.e. anything that is not part of the [ICU Message syntax], will be passed to `transformElement`.
An example of a use case for this function would be adding [diacritics] to every letter in order to stress your UI from a vertical line-height perspective.

`transformMessage` receives the entire translation message _after_ `transformElement` has been applied to its individual elements.
An example of a use case for this function would be adding padding text to the start/end of your messages in order to easily identify which text in your app has not been extracted into a `translations.json` file.

By default, a generated language's messages will be based off the `devLanguage`'s messages, but this can be overridden by providing an `extends` value that references another language.

```js
// vocab.config.js

function capitalize(message) {
  return message.toUpperCase();
}

function pad(message) {
  return '[' + message + ']';
}

module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }],
  generatedLanguages: [
    {
      name: 'generatedLanguage',
      extends: 'en',
      generator: {
        transformElement: capitalize,
        transformMessage: pad
      }
    }
  ]
};
```

Generated languages are consumed the same way as regular languages.
Any Vocab API that accepts a `language` parameter will work with a generated language as well as a regular language.

```tsx
// App.tsx

const App = () => (
  <VocabProvider language="generatedLanguage">
    <div>Hello, world!</div>
  </VocabProvider>
);
```

[icu message syntax]: https://formatjs.io/docs/intl-messageformat/#message-syntax
[diacritics]: https://en.wikipedia.org/wiki/Diacritic

## Pseudo-localization

The `@vocab/pseudo-localize` package exports low-level functions that can be used for pseudo-localization of translation messages.

```sh
$ npm install --save-dev @vocab/pseudo-localize
```

```ts
import {
  extendVowels,
  padString,
  pseudoLocalize,
  substituteCharacters
} from '@vocab/pseudo-localize';

const message = 'Hello';

// [Hello]
const paddedMessage = padString(message);

// Ḩẽƚƚö
const substitutedMessage = substituteCharacters(message);

// Heelloo
const extendedMessage = extendVowels(message);

// Extend the message and then substitute characters
// Ḩẽẽƚƚöö
const pseudoLocalizedMessage = pseudoLocalize(message);
```

Pseudo-localization is a transformation that can be applied to a translation message.
Vocab's implementation of this transformation contains the following elements:

- _Start and end markers (`padString`):_ All strings are encapsulated in `[` and `]`.

  If a developer doesn’t see these characters they know the string has been clipped by an inflexible UI element.

- _Transformation of ASCII characters to extended character equivalents (`substituteCharacters`):_ Stresses the UI from a vertical line-height perspective, tests font and encoding support, and weeds out strings that haven’t been externalized correctly (they will not have the pseudo-localization applied to them).

- _Padding text (`extendVowels`):_ Simulates translation-induced expansion.

  Vocab's implementation of this involves repeating vowels (and `y`) to simulate a 40% expansion in the message's length.

This [Netflix technology blog post] inspired Vocab's implementation of this functionality.

[netflix technology blog post]: https://netflixtechblog.com/pseudo-localization-netflix-12fff76fbcbe

### Generating a pseudo-localized language using Vocab

Vocab can generate a pseudo-localized language via the [`generatedLanguages` config][generated languages config], either via the webpack plugin or your `vocab.config.js` or `vocab.config.cjs` file.
`@vocab/pseudo-localize` exports a `generator` that can be used directly in your config.

```js
// vocab.config.js

const { generator } = require('@vocab/pseudo-localize');

module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }],
  generatedLanguages: [
    {
      name: 'pseudo',
      extends: 'en',
      generator
    }
  ]
};
```

[generated languages config]: #generated-languages

## Use Without React

If you need to use Vocab outside of React, you can access the translations directly.
You'll then be responsible for when to load translations and how to update on translation load.

#### Async access

- `getMessages(language: string) => Promise<Messages>` returns messages for the given language formatted according to the correct locale.
  If the language has not been loaded it will load the language before resolving.

> [!NOTE]
> To optimize loading time you may want to call [`load`] ahead of use.

[`load`]: #sync-access

#### Sync access

- `load(language: string) => Promise<void>` attempts to pre-load messages for the given language, resolving once loaded.
  This function only ensures the language is available and does not return any translations.
- `getLoadedMessages(language: string) => Messages | null` returns messages for the given language formatted according to the correct locale.
  If the language has not been loaded it will return `null`.
  This will not load a language that is not available.
  Useful when a synchronous (non-promise) return is required.

**Example: Promise based formatting of messages**

```ts
import translations from './.vocab';

async function getFooMessage(language) {
  let messages = await translations.getMessages(language);
  return messages['my key'].format();
}

getFooMessage().then((m) => console.log(m));
```

**Example: Synchronously returning a message**

```ts
import translations from './.vocab';

function getFooMessageSync(language) {
  let messages = translations.getLoadedMessages(language);
  if (!messages) {
    // Translations not loaded, start loading and return null for now
    translations.load();
    return null;
  }
  return messages.foo.format();
}

translations.load();

const onClick = () => {
  console.log(getFooMessageSync());
};
```

## Generate Types

Vocab generates custom `index.ts` files that give your React components strongly typed translations to work with.

To generate these files run:

```sh
vocab compile
```

Or to re-run the compiler when files change:

```sh
vocab compile --watch
```

## External Translation Tooling

Vocab can be used to synchronize your translations with translations from a remote translation platform.

| Platform | Environment Variables               |
| -------- | ----------------------------------- |
| [Phrase] | PHRASE_PROJECT_ID, PHRASE_API_TOKEN |

```sh
vocab push --branch my-branch
vocab pull --branch my-branch
```

### [Phrase] Platform Features

#### Delete Unused keys

When uploading translations, Phrase identifies keys that exist in the Phrase project, but were not
referenced in the upload. These keys can be deleted from Phrase by providing the
`--delete-unused-keys` flag to `vocab push`. E.g.

```sh
vocab push --branch my-branch --delete-unused-keys
```

[phrase]: https://developers.phrase.com/api/

#### [Tags]

`vocab push` supports uploading [tags] to Phrase.

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
keys specified in the file:

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

> [!NOTE]
> Only tags specified on keys in your [`devLanguage`][configuration] will be uploaded.
> Tags on keys in other languages will be ignored.

[tags]: https://support.phrase.com/hc/en-us/articles/5822598372252-Tags-Strings-
[configuration]: #configuration

#### Global key

`vocab push` and `vocab pull` can support global keys mapping. When you want certain translations to use a specific/custom key in Phrase, add the `globalKey` to the structure.

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

##### Error on no translation for global key

By default, `vocab pull` will not error if a translation is missing in Phrase for a translation with a global key.
If you want to throw an error in this situation, pass the `--error-on-no-global-key-translation` flag:

```sh
vocab pull --error-on-no-global-key-translation
```

## Troubleshooting

### Problem: Passed locale is being ignored or using en-US instead

When running in Node.js, the locale formatting is supported by [Node.js's Internationalization support](https://nodejs.org/api/intl.html#intl_internationalization_support).
Node.js will silently switch to the closest locale it can find if the passed locale is not available.
See Node's documentation on [Options for building Node.js](https://nodejs.org/api/intl.html#intl_options_for_building_node_js) for information on ensuring Node has the locales you need.

# Vocab

Vocab is a strongly typed internationalization framework for React.

Vocab helps you ship multiple languages without compromising the reliability of your site or slowing down delivery.

- Shareable translations

  Translations are co-located with the components that use them. Vocab uses the module graph allowing shared components to be installed with package managers like npm, just like any other module.

- Loading translations dynamically

  Vocab only loads the current user's language. If the language changes Vocab can load the new language behind the scenes without reloading the page.

- Strongly typed with TypeScript

  When using translations TypeScript will ensure code only accesses valid translations and translations are passed all required dynamic values.

## Getting started

### Step 1: Install Dependencies

Vocab is a monorepo with different packages you can install depending on your usage, the below list will get you started using the cli, React and webpack integrations.

```bash
$ npm i --save @vocab/cli @vocab/react @vocab/webpack
```

### Step 2: Configure Vocab

You can configure Vocab directly when calling the API or via a `vocab.config.js` file.

In this example we've configured two languages, English and French, where our initial `translation.json` files will use English.

**vocab.config.js**

```js
module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }]
};
```

### Step 3: Set the language using the React Provider

Vocab doesn't tell you how to select or change your language. You just need to tell Vocab what language to use.

**Note:** Using methods discussed later we'll make sure the first language is loaded on page load. However, after this, changing languages may then lead to a period of no translations as Vocab downloads the new language's translations.

**src/App.tsx**

```tsx
import { VocabProvider } from '@vocab/react';

function App({ children }) {
  return (
    <VocabProvider language={language}>
      {children}
    </VocabProvider>
  );
}
```

### Step 4: Create initial values and use them

A translation file is a JSON file consisting of a flat structure of keys, each with a message and an optional description.

**Note:** Currently, to create a new translation it must be placed inside a folder ending in **`.vocab`**, this folder suffix can be configured with the `translationsDirectorySuffix` configuration value.

**`./example.vocab/translations.json`**

```json
{
  "my key": {
    "message": "Hello from Vocab",
    "description": "An optional description to help when translating"
  }
}
```

Then run `vocab compile`. Or `vocab compile --watch`.
This will create a new `index.ts` file for each folder ending in **`.vocab`**.

You can then import these translations into your React components. Translations can be used by calling the `t` function returned by `useTranslations`.

**./MyComponent.tsx**

```tsx
import { useTranslations } from '@vocab/react';
import translations from './example.vocab';

function MyComponent({ children }) {
  const { t } = useTranslations(translations);
  return <div>{t('my key')}</div>;
}
```

### Step 5: Create translations

So far, your app will run, but you're missing any translations other than the initial language. The below file can be created manually; however, you can also integrate with a remote translation platform to push and pull translations automatically. See [External translation tooling](#external-translation-tooling) for more information.

**./example.vocab/fr-FR.translations.json**

```json
{
  "my key": {
    "message": "Bonjour de Vocab",
    "description": "An optional description to help when translating"
  }
}
```

### Step 6: [Optional] Set up Webpack plugin

Right now every language is loaded into your web application all the time, which could lead to a large bundle size. Ideally you will want to switch out the Node/default runtime for web runtime that will load only the active language.

This is done using the **VocabWebpackPlugin**. Applying this plugin to your client webpack configuration will replace all vocab files with a dynamic asynchronous chunks designed for the web.

**webpack.config.js**

```js
const { VocabWebpackPlugin } = require('@vocab/webpack');

module.exports = {
  ...,
  plugins: [new VocabWebpackPlugin()]
}
```

### Step 7: [Optional] Optimize for fast page loading

Using the above method without optimizing what chunks webpack uses you may find the page needing to do an extra round trip to load languages on a page.

This is where `getChunkName` can be used to retrieve the Webpack chunk used for a specific language.

For example, here is a Server Render function that would add the current language chunk to [Loadable component's ChunkExtractor](https://loadable-components.com/docs/api-loadable-server/#chunkextractor).

**src/render.tsx**

```tsx
import { getChunkName } from '@vocab/webpack/chunk-name';

// ...

const chunkName = getChunkName(language);

const extractor = new ChunkExtractor();

extractor.addChunk(chunkName);
```

## ICU Message format

Translation messages can sometimes contain dynamic values, such as dates/times, links or usernames. These values can often exist somewhere in the middle of a message and change location based on translation.

To support this Vocab uses [Format.js's intl-messageformat] allowing you to use [ICU Message syntax](https://formatjs.io/docs/core-concepts/icu-syntax/) in your messages.

In the below example we use two messages, one that passes in a single parameter and one uses a component.

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

Vocab will automatically parse these strings as ICU messages, identify the required parameters and ensure TypeScript knows the values must be passed in.

```tsx
t('my key with param', { name: 'Vocab' });
t('my key with component', {
  Link: (children) => <a href="/foo">{children}</a>
});
```

## Configuration

Configuration can either be passed into the Node API directly or be gathered from the nearest _vocab.config.js_ file.

**vocab.config.js**

```js
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
      name: 'generatedLangauge',
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

**vocab.config.js**

```js
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

**App.tsx**

```tsx
const App = () => (
  <VocabProvider language="generatedLanguage">
    ...
  </VocabProvider>
);
```

[icu message syntax]: https://formatjs.io/docs/intl-messageformat/#message-syntax
[diacritics]: https://en.wikipedia.org/wiki/Diacritic

## Pseudo-localization

The `@vocab/pseudo-localize` package exports low-level functions that can be used for pseudo-localization of translation messages.

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

- _Start and end markers (`padString`):_ All strings are encapsulated in `[` and `]`. If a developer doesn’t see these characters they know the string has been clipped by an inflexible UI element.
- _Transformation of ASCII characters to extended character equivalents (`substituteCharacters`):_ Stresses the UI from a vertical line-height perspective, tests font and encoding support, and weeds out strings that haven’t been externalized correctly (they will not have the pseudo-localization applied to them).
- _Padding text (`extendVowels`):_ Simulates translation-induced expansion. Vocab's implementation of this involves repeating vowels (and `y`) to simulate a 40% expansion in the message's length.

This Netflix technology [blog post][blog post] inspired Vocab's implementation of this
functionality.

### Generating a pseudo-localized language using Vocab

Vocab can generate a pseudo-localized language via the [`generatedLanguages` config][generated languages config], either via the webpack plugin or your `vocab.config.js` file.
`@vocab/pseudo-localize` exports a `generator` that can be used directly in your config.

**vocab.config.js**

```js
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

[blog post]: https://netflixtechblog.com/pseudo-localization-netflix-12fff76fbcbe
[generated languages config]: #generated-languages

## Use without React

If you need to use Vocab outside of React, you can access the returned Vocab file directly. You'll then be responsible for when to load translations and how to update on translation load.

#### Async access

- `getMessages(language: string) => Promise<Messages>` returns messages for the given language formatted according to the correct locale. If the language has not been loaded it will load the language before resolving.

**Note:** To optimize loading time you may want to call `load` (see below) ahead of use.

#### Sync access

- `load(language: string) => Promise<void>` attempts to pre-load messages for the given language. Resolving once complete. Note this only ensures the language is available and does not return any translations.
- `getLoadedMessages(language: string) => Messages | null` returns messages for the given language formatted according to the correct locale. If the language has not been loaded it will return `null`. Note that this will not load the language if it's not available. Useful when a synchronous (non-promise) return is required.

**Example: Promise based formatting of messages**

```typescript
import translations from './.vocab';

async function getFooMessage(language) {
  let messages = await translations.getMessages(language);
  return messages['my key'].format();
}

getFooMessage().then((m) => console.log(m));
```

**Example: Synchronously returning a message**

```typescript
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

```bash
$ vocab compile
```

Or to re-run the compiler when files change use:

```bash
$ vocab compile --watch
```

## External Translation Tooling

Vocab can be used to synchronize your translations with translations from a remote translation platform.

| Platform | Environment Variables               |
| -------- | ----------------------------------- |
| [Phrase] | PHRASE_PROJECT_ID, PHRASE_API_TOKEN |

```bash
$ vocab push --branch my-branch
$ vocab pull --branch my-branch
```

### [Phrase] Platform Features

#### Delete Unused keys

When uploading translations, Phrase identifies keys that exist in the Phrase project, but were not
referenced in the upload. These keys can be deleted from Phrase by providing the
`---delete-unused-keys` flag to `vocab push`. E.g.

```sh
$ vocab push --branch my-branch --delete-unused-keys
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

**NOTE**: Only tags specified on keys in your [`devLanguage`][configuration] will be uploaded.
Tags on keys in other languages will be ignored.

[tags]: https://support.phrase.com/hc/en-us/articles/5822598372252-Tags-Strings-
[configuration]: #Configuration

## Troubleshooting

### Problem: Passed locale is being ignored or using en-US instead

When running in Node.js the locale formatting is supported by [Node.js's Internationalization support](https://nodejs.org/api/intl.html#intl_internationalization_support). Node.js will silently switch to the closest locale it can find if the passed locale is not available.
See Node's documentation on [Options for building Node.js](https://nodejs.org/api/intl.html#intl_options_for_building_node_js) for information on ensuring Node has the locales you need.

### License

MIT.

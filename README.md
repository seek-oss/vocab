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
  Link: (children) => <Link href="/foo">{children}</Link>
});
```

## Configuration

Configuration can either be passed into the Node API directly or be gathered from the nearest _vocab.config.js_ file.

**vocab.config.js**

```js
module.exports = {
  devLanguage: 'en',
  languages: [
    { name: 'en' },
    { name: 'en-AU', extends: 'en' },
    { name: 'en-US', extends: 'en' },
    { name: 'fr-FR' }
  ],
  /**
   * The root directory to compile and validate translations
   * Default: Current working directory
   */
  projectRoot: ['./example/'];
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

## External translation tooling

Vocab can be used to synchronize your translations with translations from a remote translation platform.

| Platform                                     | Environment Variables               |
| -------------------------------------------- | ----------------------------------- |
| [Phrase](https://developers.phrase.com/api/) | PHRASE_PROJECT_ID, PHRASE_API_TOKEN |

```bash
$ vocab push --branch my-branch
$ vocab pull --branch my-branch
```

## Troubleshooting

### Problem: Passed locale is being ignored or using en-US instead

When running in Node.js the locale formatting is supported by [Node.js's Internationalization support](https://nodejs.org/api/intl.html#intl_internationalization_support). Node.js will silently switch to the closest locale it can find if the passed locale is not available.
See Node's documentation on [Options for building Node.js](https://nodejs.org/api/intl.html#intl_options_for_building_node_js) for information on ensuring Node has the locales you need.

### License

MIT.

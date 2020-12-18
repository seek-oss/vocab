# Vocab

Vocab is a strongly typed internationalisation framework for React.

## Getting started

### Step 1: Install Dependencies

Vocab is a monorepo with different packages you can install depending on your usage, the below list will get you started using the cli, React and webpack integrations.

```bash
$ npm i --save @vocab/cli @vocab/react @vocab/webpack
```

### Step 2: Setup Webpack plugin

Before starting to write code you'll need to setup webpack to understand how to use `translation.json` files.

This is done using the **VocabWebpackPlugin**.

**webpack.config.js**

```js
const VocabWebpackPlugin = require('@vocab/webpack').default;

module.exports = {
  ...,
  plugins: [new VocabWebpackPlugin({})]
}
```

### Step 3: Configure Vocab

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

**Note:** Using methods discussed later we'll make sure the first language is loaded on page load. However, after this changing languages may then lead to a period of no translations as Vocab downloads the new language's translations.

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

So far your app will run, but you're missing any translations other than the initial language. The below file can be created manually; however, you can also integrate with a remote translation platform to push and pull translations automatically. See [Externeral translation tooling](#external-translation-tooling) for more information.

**./example.vocab/fr-FR.translations.json**

```json
{
  "my key": {
    "message": "Bonjour de Vocab",
    "decription": "An optional description to help when translating"
  }
}
```

### Step 6: Optimize for fast page loading

Using the above method without optimizing what chunks webpack uses you may find the page needing to do an extra round trip to load languages on a page.

This is where `getChunkName` can be used to retrieve the Webpack chunk used for a specific language.

For example here is a Server Render function that would add the current language chunk to [Loadable component's ChunkExtractor](https://loadable-components.com/docs/api-loadable-server/#chunkextractor).

**src/render.tsx**

```tsx
import { getChunkName } from '@vocab/webpack/chunk-name';

// ...

const chunkName = getChunkName(language);

const extractor = new ChunkExtractor();

extractor.addChunk(chunkName);
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

Vocab can be used to syncronize your translations with translations from a remote translation platform.

| Platform                                     | Environment Variables               |
| -------------------------------------------- | ----------------------------------- |
| [Phrase](https://developers.phrase.com/api/) | PHRASE_PROJECT_ID, PHRASE_API_TOKEN |

```bash
$ vocab push --branch my-branch
$ vocab pull --branch my-branch
```

### License

MIT.

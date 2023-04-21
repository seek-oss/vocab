import path from 'path';

import type {
  LoadedTranslation,
  UserConfig,
  TranslationMessagesByKey,
} from '@vocab/core';
import { init as initModuleLexer, parse } from 'es-module-lexer';
import { getDevLanguageFileFromTsFile, loadTranslation } from '@vocab/core';
import type { LoaderContext as WebpackLoaderContext } from 'webpack';

import { getChunkName } from './chunk-name';
import { trace as _trace } from './logger';

type LoaderContext = WebpackLoaderContext<UserConfig>;

const trace = _trace.extend('loader');

// Resolve virtual-resource-loader dependency from current package
const virtualResourceLoader = require.resolve('virtual-resource-loader');

function createIdentifier(
  lang: string,
  resourcePath: string,
  loadedTranslation: LoadedTranslation,
) {
  trace('Creating identifier for language', lang);
  const languageTranslations = loadedTranslation.languages[lang] ?? {};

  const langJson: TranslationMessagesByKey = {};

  for (const key of loadedTranslation.keys) {
    langJson[key] = languageTranslations[key].message;
  }

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  const unloader = `${virtualResourceLoader}?source=${base64}`;
  const fileIdent = path.basename(resourcePath, 'translations.json');

  return `./${fileIdent}-${lang}-virtual.json!=!${unloader}!`;
}

// reimplement `stringifyRequest` from loader-utils 2.x
// https://github.com/webpack/loader-utils/blob/master/CHANGELOG.md#300-2021-10-20
function stringifyRequest(this: LoaderContext, request: string) {
  return JSON.stringify(this.utils.contextify(this.context, request));
}

function renderLanguageLoaderAsync(
  this: LoaderContext,
  resourcePath: string,
  loadedTranslation: LoadedTranslation,
) {
  return (lang: string) => {
    const identifier = stringifyRequest.call(
      this,
      createIdentifier(lang, resourcePath, loadedTranslation),
    );

    return /* ts */ `
      createLanguage(
        require.resolveWeak(${identifier}),
        () => import(
          /* webpackChunkName: ${JSON.stringify(getChunkName(lang))} */
          ${identifier}
        )
      )
    `.trim();
  };
}

function findExportNames(source: string) {
  const [, exports] = parse(source);
  return exports;
}

export default async function vocabLoader(this: LoaderContext, source: string) {
  trace(`Using vocab loader for ${this.resourcePath}`);
  const callback = this.async();

  if (!callback) {
    throw new Error(`Webpack didn't provide an async callback`);
  }

  await initModuleLexer;
  const config = this.getOptions();

  const devJsonFilePath = getDevLanguageFileFromTsFile(this.resourcePath);

  const loadedTranslation = loadTranslation(
    { filePath: devJsonFilePath, fallbacks: 'all' },
    config,
  );

  const target = this.target;
  if (target && target !== 'web') {
    trace(`Why are you using the loader on ${target}?`);
    callback(new Error('Called Vocab Loader with non-web target'));
    return;
  }

  const renderLanguageLoader = renderLanguageLoaderAsync.call(
    this,
    devJsonFilePath,
    loadedTranslation,
  );

  const loadedLanguages = Object.keys(loadedTranslation.languages);
  const exportName = findExportNames(source)[0];

  const result = /* ts */ `
    import { createLanguage, createTranslationFile } from '@vocab/webpack/${target}';

    const translations = createTranslationFile({
      ${loadedLanguages
        .map((lang) => `${JSON.stringify(lang)}: ${renderLanguageLoader(lang)}`)
        .join(',\n')}
    });
    export { translations as ${exportName} };
  `;
  trace('Created translation file', result);

  callback(null, result);
}

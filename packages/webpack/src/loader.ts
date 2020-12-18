import path from 'path';

import {
  LoadedTranslation,
  UserConfig,
  TranslationMessagesByKey,
} from '@vocab/types';
import {
  getAltLanguages,
  getDevLanguageFileFromTsFile,
  loadTranslation,
} from '@vocab/core';
import { getOptions } from 'loader-utils';

import { getChunkName } from './chunk-name';
import { trace as _trace } from './logger';

const trace = _trace.extend('loader');
interface LoaderContext {
  addDependency: (filePath: string) => void;
  target: string;
  resourcePath: string;
  async: () => (err: unknown, result?: string) => void;
}

function createIdentifier(
  lang: string,
  resourcePath: string,
  loadedTranslation: LoadedTranslation,
) {
  const languageTranslations = loadedTranslation.languages[lang] ?? {};

  const langJson: TranslationMessagesByKey = {};

  for (const key of loadedTranslation.keys) {
    langJson[key] = languageTranslations[key].message;
  }

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  const unloader = `@vocab/unloader?source=${base64}`;
  const fileIdent = path.basename(resourcePath, 'translations.json');

  return `./${fileIdent}-${lang}-virtual.json!=!${unloader}!json-loader!`;
}

const renderLanguageLoaderAsync = (
  resourcePath: string,
  loadedTranslation: LoadedTranslation,
) => (lang: string) => {
  const identifier = createIdentifier(lang, resourcePath, loadedTranslation);

  return `${lang}: createLanguage(require.resolveWeak('${identifier}'), () => import(
      /* webpackChunkName: "${getChunkName(lang)}" */
      '${identifier}'
    ), '${lang}')`;
};

export default async function vocabLoader(this: LoaderContext) {
  trace(`Using vocab loader for ${this.resourcePath}`);
  const callback = this.async();

  if (!callback) {
    throw new Error(`Webpack didn't provide an async callback`);
  }

  const config = (getOptions(this) as unknown) as UserConfig;

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
  const renderLanguageLoader = renderLanguageLoaderAsync(
    devJsonFilePath,
    loadedTranslation,
  );

  const result = `
      import { createLanguage } from '@vocab/webpack/${target}';

      export default {
          ${renderLanguageLoader(config.devLanguage)},
          ${getAltLanguages(config)
            .map((altLanguage) => renderLanguageLoader(altLanguage))
            .join(',')}
      };
    `;
  trace('Created translation file', result);

  callback(null, result);
}

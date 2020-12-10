import path from 'path';

import {
  LoadedTranslation,
  UserConfig,
  TranslationMessagesByKey,
} from '@vocab/types';
import {
  getAltLanguageFilePath,
  getAltLanguages,
  loadTranslation,
} from '@vocab/core';
import { getOptions } from 'loader-utils';

import { getChunkName } from './chunk-name';
import { trace } from './logger';

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

  const unloader = `${require.resolve('@vocab/unloader')}?source=${base64}`;
  const fileIdent = path.basename(resourcePath, '.translations.json');

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

const renderLanguageLoaderSync = (
  resourcePath: string,
  loadedTranslation: LoadedTranslation,
) => (lang: string) => {
  const identifier = createIdentifier(lang, resourcePath, loadedTranslation);

  return `${lang}: createLanguage(require('${identifier}'), '${lang}')`;
};

export default async function vocabLoader(this: LoaderContext) {
  trace(`Using vocab loader for ${this.resourcePath}`);
  const callback = this.async();

  if (!callback) {
    throw new Error(`Webpack didn't provide an async callback`);
  }

  const config = (getOptions(this) as unknown) as UserConfig;

  const altLanguages = getAltLanguages(config);

  for (const lang of altLanguages) {
    this.addDependency(getAltLanguageFilePath(this.resourcePath, lang, config));
  }

  const loadedTranslation = loadTranslation(
    { filePath: this.resourcePath, fallbacks: 'all' },
    config,
  );

  const target = this.target;
  const renderLanguageLoader =
    target === 'web'
      ? renderLanguageLoaderAsync(this.resourcePath, loadedTranslation)
      : renderLanguageLoaderSync(this.resourcePath, loadedTranslation);

  callback(
    null,
    `
    import { createLanguage } from '@vocab/webpack/${target}';

    export default {
      __DO_NOT_USE__: {
        ${renderLanguageLoader(config.devLanguage)},
        ${altLanguages
          .map((altLanguage) => renderLanguageLoader(altLanguage))
          .join(',')}
      }
    };
  `,
  );
}

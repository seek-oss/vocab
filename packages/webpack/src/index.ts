import path from 'path';

import {
  getAltLanguageFilePath,
  getChunkName,
  getDevLanguage,
  getAltLanguages,
  loadConfig,
  loadTranslation,
} from '@vocab/core';
import { getOptions } from 'loader-utils';

interface LoaderContext {
  addDependency: (filePath: string) => void;
  target: string;
  resourcePath: string;
  async: () => (err: unknown, result?: string) => void;
}

function createIdentifier(lang: string, resourcePath: string) {
  const loadedTranslation = loadTranslation(resourcePath, true);

  const langJson = loadedTranslation.languages.get(lang);

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  const unloader = `${require.resolve('@vocab/unloader')}?source=${base64}`;
  const fileIdent = path.basename(resourcePath, '.translations.json');

  return `./${fileIdent}-${lang}-virtual.json!=!${unloader}!json-loader!`;
}

function renderLanguageLoaderAsync(lang: string, resourcePath: string) {
  const identifier = createIdentifier(lang, resourcePath);

  return `${lang}: createLanguage(require.resolveWeak('${identifier}'), () => import(
      /* webpackChunkName: "${getChunkName(lang)}" */
      '${identifier}'
    ), '${lang}')`;
}

function renderLanguageLoaderSync(lang: string, resourcePath: string) {
  const identifier = createIdentifier(lang, resourcePath);

  return `${lang}: createLanguage(require('${identifier}'), '${lang}')`;
}

export default async function vocabLoader(this: LoaderContext) {
  const callback = this.async();

  if (!callback) {
    throw new Error(`Webpack didn't provide an async callback`);
  }

  const options = getOptions(this);
  try {
    await loadConfig(options.configFile as string);
  } catch (error) {
    callback(error);
  }
  const altLanguages = getAltLanguages();

  for (const lang of altLanguages) {
    this.addDependency(getAltLanguageFilePath(this.resourcePath, lang));
  }

  const target = this.target;
  const renderLanguageLoader =
    target === 'web' ? renderLanguageLoaderAsync : renderLanguageLoaderSync;

  callback(
    null,
    `
    import { createLanguage } from '@vocab/webpack/${target}';

    export default {
      __DO_NOT_USE__: {
        ${renderLanguageLoader(getDevLanguage(), this.resourcePath)},
        ${altLanguages
          .map((altLanguage) =>
            renderLanguageLoader(altLanguage, this.resourcePath),
          )
          .join(',')}
      }
    };
  `,
  );
}

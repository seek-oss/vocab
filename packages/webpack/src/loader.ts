import path from 'path';

import { UserConfig } from '@vocab/types';
import {
  getAltLanguageFilePath,
  getAltLanguages,
  loadTranslation,
} from '@vocab/core';
import { getOptions } from 'loader-utils';
import { getChunkName } from './chunk-name';

interface LoaderContext {
  addDependency: (filePath: string) => void;
  target: string;
  resourcePath: string;
  async: () => (err: unknown, result?: string) => void;
}

function createIdentifier(
  lang: string,
  resourcePath: string,
  config: UserConfig,
) {
  const loadedTranslation = loadTranslation(
    { filePath: resourcePath, fallbacks: 'all' },
    config,
  );

  const langJson = loadedTranslation.languages.get(lang);

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  const unloader = `${require.resolve('@vocab/unloader')}?source=${base64}`;
  const fileIdent = path.basename(resourcePath, '.translations.json');

  return `./${fileIdent}-${lang}-virtual.json!=!${unloader}!json-loader!`;
}

function renderLanguageLoaderAsync(
  lang: string,
  resourcePath: string,
  config: UserConfig,
) {
  const identifier = createIdentifier(lang, resourcePath, config);

  return `${lang}: createLanguage(require.resolveWeak('${identifier}'), () => import(
      /* webpackChunkName: "${getChunkName(lang)}" */
      '${identifier}'
    ), '${lang}')`;
}

function renderLanguageLoaderSync(
  lang: string,
  resourcePath: string,
  config: UserConfig,
) {
  const identifier = createIdentifier(lang, resourcePath, config);

  return `${lang}: createLanguage(require('${identifier}'), '${lang}')`;
}

export default async function vocabLoader(this: LoaderContext) {
  const callback = this.async();

  if (!callback) {
    throw new Error(`Webpack didn't provide an async callback`);
  }

  const config = (getOptions(this) as unknown) as UserConfig;

  const altLanguages = getAltLanguages(config);

  for (const lang of altLanguages) {
    this.addDependency(getAltLanguageFilePath(this.resourcePath, lang, config));
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
        ${renderLanguageLoader(config.devLanguage, this.resourcePath, config)},
        ${altLanguages
          .map((altLanguage) =>
            renderLanguageLoader(altLanguage, this.resourcePath, config),
          )
          .join(',')}
      }
    };
  `,
  );
}

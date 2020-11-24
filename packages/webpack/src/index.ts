import {
  getAltLanguageFilePath,
  getChunkName,
  getDefaultLanguage,
  getAltLanguages,
  loadConfig,
  loadTranslation,
} from '@vocab/utils';
import { getOptions } from 'loader-utils';

interface LoaderContext {
  addDependency: (filePath: string) => void;
  target: string;
  resourcePath: string;
  async: () => (err: unknown, result?: string) => void;
}
interface LanguageFile {
  lang: string;
  filePath: string;
}

function createIdentifier(lang: string, filePath: string) {
  const loadedTranslation = loadTranslation(filePath);

  const langJson = loadedTranslation.languages.get(lang);

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  const unloader = `${require.resolve('@vocab/unloader')}?source=${base64}`;

  return `./${lang}-virtual.json!=!${unloader}!json-loader!`;
}

function renderLanguageLoaderAsync({ lang, filePath }: LanguageFile) {
  const identifier = createIdentifier(lang, filePath);
  return `${lang}: createLanguage(require.resolveWeak('${identifier}'), () => import(
      /* webpackChunkName: "${getChunkName(lang)}" */
      '${identifier}'
    ), '${lang}')`;
}

function renderLanguageLoaderSync({ lang, filePath }: LanguageFile): string {
  return `${lang}: createLanguage(require('${createIdentifier(
    lang,
    filePath,
  )}'), '${lang}')`;
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

  const altLanguageFiles = [];
  for (const lang of altLanguages) {
    altLanguageFiles.push({
      filePath: getAltLanguageFilePath(this.resourcePath, lang),
      lang,
    });
  }

  for (const altLanguageFile of altLanguageFiles) {
    this.addDependency(altLanguageFile.filePath);
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
        ${renderLanguageLoader({
          lang: getDefaultLanguage(),
          filePath: this.resourcePath,
        })},
        ${altLanguageFiles
          .map((altLanguageFile) => renderLanguageLoader(altLanguageFile))
          .join(',')}
      }
    };
  `,
  );
}

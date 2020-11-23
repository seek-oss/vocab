import {
  getAltLanguageFilePath,
  getChunkName,
  getDefaultLanguage,
  getAltLanguages,
  loadConfig,
} from '@vocab/utils';
import { getOptions } from 'loader-utils';

interface LoaderContext {
  addDependency: (filePath: string) => void;
  target: string;
  resourcePath: string;
  async: () => (err: unknown, result: string) => void;
}

interface LanguageFile {
  lang: string;
  filePath: string;
  useJsonLoader?: boolean;
}

function renderLanguageLoaderAsync({
  lang,
  filePath,
  useJsonLoader = false,
}: LanguageFile) {
  const identifier = `!!${useJsonLoader ? 'json-loader!' : ''}${filePath}`;
  return `${lang}: createLanguage(require.resolveWeak('${identifier}'), () => import(
      /* webpackChunkName: "${getChunkName(lang)}" */
      '${identifier}'
    ), '${lang}')`;
}

function renderLanguageLoaderSync({
  lang,
  filePath,
  useJsonLoader = false,
}: LanguageFile): string {
  return `${lang}: createLanguage(require('!!${
    useJsonLoader ? 'json-loader!' : ''
  }${filePath}'), '${lang}')`;
}

export default async function vocabLoader(this: LoaderContext) {
  const callback = this.async();

  if (!callback) {
    throw new Error(`Webpack didn't provide an async callback`);
  }

  // TODO: Validate loader options
  const options = getOptions(this);

  await loadConfig(options.configFile as string);

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
          useJsonLoader: true,
        })},
        ${altLanguageFiles
          .map((altLanguageFile) => renderLanguageLoader(altLanguageFile))
          .join(',')}
      }
    };
  `,
  );
}

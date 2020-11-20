import {
  getAltLanguageFilePath,
  getChunkName,
  getDefaultLanguage,
  getAltLanguages,
} from '@vocab/utils';

interface WebpackLoader {
  addDependency: (filePath: string) => void;
  target: string;
  resourcePath: string;
  async: () => (result: string) => void;
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

export default async function vocabLoader(this: WebpackLoader) {
  const callback = this.async();

  const altLanguages = await getAltLanguages();

  const altLanguageFiles = [];
  for (const lang of altLanguages) {
    altLanguageFiles.push({
      filePath: await getAltLanguageFilePath(this.resourcePath, lang),
      lang,
    });
  }

  for (const altLanguageFile of altLanguageFiles) {
    this.addDependency(altLanguageFile.filePath);
  }

  const target = this.target;
  const renderLanguageLoader =
    target === 'web' ? renderLanguageLoaderAsync : renderLanguageLoaderSync;

  callback(`
    import { createLanguage } from '@vocab/webpack/${target}';

    export default {
      __DO_NOT_USE__: {
        ${renderLanguageLoader({
          lang: await getDefaultLanguage(),
          filePath: this.resourcePath,
          useJsonLoader: true,
        })},
        ${altLanguageFiles
          .map((altLanguageFile) => renderLanguageLoader(altLanguageFile))
          .join(',')}
      }
    };
  `);
}

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

export default function vocabLoader(this: WebpackLoader) {
  console.log('Loading', this.target, this.resourcePath);
  const altLanguageFiles = getAltLanguages().map(lang => ({
    filePath: getAltLanguageFilePath(this.resourcePath, lang),
    lang,
  }));

  for (const altLanguageFile of altLanguageFiles) {
    this.addDependency(altLanguageFile.filePath);
  }

  const target = this.target;
  const renderLanguageLoader =
    target === 'web' ? renderLanguageLoaderAsync : renderLanguageLoaderSync;

  const result = `
    import { createLanguage } from '@vocab/${target}';

    export default {
      __DO_NOT_USE__: {
        ${renderLanguageLoader({
          lang: getDefaultLanguage(),
          filePath: this.resourcePath,
          useJsonLoader: true,
        })},
        ${altLanguageFiles
          .map(altLanguageFile => renderLanguageLoader(altLanguageFile))
          .join(',')}
      }
    };
  `;

  return result;
}

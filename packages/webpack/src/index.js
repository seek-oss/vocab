/* eslint-disable no-console */
const {
  getAltLanguageFilePath,
  getChunkName,
  getDefaultLanguage,
  getAltLanguages,
} = require('@vocab/utils');

function renderLanguageLoaderAsync({ lang, filePath, useJsonLoader = false }) {
  const identifier = `!!${useJsonLoader ? 'json-loader!' : ''}${filePath}`;
  return `${lang}: createLanguage(require.resolveWeak('${identifier}'), () => import(
      /* webpackChunkName: "${getChunkName(lang)}" */
      '${identifier}'
    ), '${lang}')`;
}

function renderLanguageLoaderSync({ lang, filePath, useJsonLoader = false }) {
  return `${lang}: createLanguage(require('!!${
    useJsonLoader ? 'json-loader!' : ''
  }${filePath}'), '${lang}')`;
}

module.exports = function loader() {
  console.log('Loading', this.target, this.resourcePath);
  const altLanguageFiles = getAltLanguages().map((lang) => ({
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
    import { createLanguage } from '@vocab/webpack/runtime/${target}';

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
  `;

  return result;
};

import {
  getDevLanguageFileFromTsFile,
  type LoadedTranslation,
  loadTranslation,
  type TranslationMessagesByKey,
  type UserConfig,
} from '@vocab/core';

export const transformVocabFile = (
  code: string,
  id: string,
  config: UserConfig,
) => {
  // Todo: Lex the code to determine if it's a CommonJS or ES module
  let result = code;

  const devJsonFilePath = getDevLanguageFileFromTsFile(id);

  const loadedTranslation = loadTranslation(
    { filePath: devJsonFilePath, fallbacks: 'all' },
    config,
  );

  const renderLanguageLoader = renderLanguageLoaderAsync(
    devJsonFilePath,
    loadedTranslation,
  );

  const translations = /* ts */ `
    const translations = createTranslationFile({
      ${Object.keys(loadedTranslation.languages)
        .map((lang) => `${JSON.stringify(lang)}: ${renderLanguageLoader(lang)}`)
        .join(',\n')}
      });
  `;

  result = /* ts */ `
      import { createLanguage, createTranslationFile } from '@vocab/vite/create-language';
      ${translations}
      export default translations;
    `;

  return result;
};

function renderLanguageLoaderAsync(
  resourcePath: string,
  loadedTranslation: LoadedTranslation,
) {
  return (lang: string) => {
    const identifier = JSON.stringify(
      createIdentifier(lang, resourcePath, loadedTranslation),
    );

    return /* ts */ `createLanguage(() => import(${identifier}))`.trim();
  };
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

  // TODO: clean up virtual resource path. Vite does not require encoding/decoding the source
  const unloader = `?source=${encodeURIComponent(base64)}`;

  return `./${lang}-vocab-virtual-module.json${unloader}`;
}

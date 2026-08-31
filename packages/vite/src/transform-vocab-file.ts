import {
  getDevLanguageFileFromTsFile,
  type LoadedTranslation,
  loadTranslation,
  type TranslationMessagesByKey,
  type UserConfig,
} from '@vocab/core';

import * as esModuleLexer from 'es-module-lexer';
import * as cjsModuleLexer from 'cjs-module-lexer';

import type { MessagesByModuleId } from './render-preload-module';
import { getRegistryModuleId } from './registry-module-id';

import { trace as _trace } from './logger';

const trace = _trace.extend('transform');

function findExportNames(source: string, mode: 'cjs'): string[];
function findExportNames(
  source: string,
  mode: 'esm',
): esModuleLexer.ExportSpecifier[];
function findExportNames(source: string, mode: 'cjs' | 'esm') {
  if (mode === 'esm') {
    const [, exports] = esModuleLexer.parse(source);
    return exports;
  }
  const { exports } = cjsModuleLexer.parse(source);
  return exports;
}

export const transformVocabFile = async (
  code: string,
  id: string,
  config: UserConfig,
  projectRoot: string,
  messagesByLang: Map<string, MessagesByModuleId>,
  getPreloadReference: (lang: string) => string,
) => {
  trace('Transforming vocab file', id);

  let result = code;

  const devJsonFilePath = getDevLanguageFileFromTsFile(id);

  const loadedTranslation = loadTranslation(
    { filePath: devJsonFilePath, fallbacks: 'all' },
    config,
  );

  const renderLanguageLoader = renderLanguageLoaderAsync(
    loadedTranslation,
    devJsonFilePath,
    projectRoot,
    messagesByLang,
    getPreloadReference,
  );

  const translations = /* ts */ `
    const translations = createTranslationFile({
      ${Object.keys(loadedTranslation.languages)
        .map((lang) => `${JSON.stringify(lang)}: ${renderLanguageLoader(lang)}`)
        .join(',\n')}
      });
  `;

  await esModuleLexer.init;
  const esmExports = findExportNames(code, 'esm');
  if (esmExports.length > 0) {
    const exportName = esmExports[0];
    trace(`Found ESM export '${exportName.n}' in ${id}`);

    result = /* ts */ `
      import { createLanguage, createTranslationFile } from '@vocab/vite/runtime';
      ${translations}
      export { translations as ${exportName.n} };
    `;
  } else {
    // init needs to be called and waited upon
    await cjsModuleLexer.init();

    const exportName = findExportNames(code, 'cjs')[0];
    trace(`Found CJS export '${exportName}' in ${id}`);

    result = /* ts */ `
      import { createLanguage, createTranslationFile } from '@vocab/vite/runtime';
      ${translations}
      exports.${exportName} = translations;
    `;
  }
  trace('Created translation file', result);

  return result;
};

const renderLanguageLoaderAsync =
  (
    loadedTranslation: LoadedTranslation,
    devTranslationFilePath: string,
    projectRoot: string,
    messagesByLang: Map<string, MessagesByModuleId>,
    getPreloadReference: (language: string) => string,
  ) =>
  (language: string) => {
    const moduleId = getRegistryModuleId(
      language,
      devTranslationFilePath,
      projectRoot,
    );

    let messagesByModuleId = messagesByLang.get(language);
    if (!messagesByModuleId) {
      messagesByModuleId = new Map();
      messagesByLang.set(language, messagesByModuleId);
    }
    messagesByModuleId.set(moduleId, getMessages(language, loadedTranslation));

    return /* ts */ `createLanguage(${JSON.stringify(moduleId)}, () => import(
      /* @vite-ignore */
      import.meta.ROLLUP_FILE_URL_${getPreloadReference(language)}
    ))`.trim();
  };

const getMessages = (
  lang: string,
  loadedTranslation: LoadedTranslation,
): TranslationMessagesByKey => {
  const languageTranslations = loadedTranslation.languages[lang] ?? {};

  const messages: TranslationMessagesByKey = {};

  for (const key of loadedTranslation.keys) {
    messages[key] = languageTranslations[key].message;
  }

  return messages;
};

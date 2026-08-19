import {
  getDevLanguageFileFromTsFile,
  type LoadedTranslation,
  loadTranslation,
  type TranslationMessagesByKey,
  type UserConfig,
} from '@vocab/core';

import * as esModuleLexer from 'es-module-lexer';
import * as cjsModuleLexer from 'cjs-module-lexer';

import {
  getPreloadModuleId,
  registryIdQueryKey,
  sourceQueryKey,
  virtualModuleId,
} from './consts';

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
  identifiersByLang: Map<string, Set<string>>,
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
    identifiersByLang,
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

const addIdentifier = (
  identifiersByLang: Map<string, Set<string>>,
  lang: string,
  identifier: string,
) => {
  let identifiers = identifiersByLang.get(lang);
  if (!identifiers) {
    identifiers = new Set();
    identifiersByLang.set(lang, identifiers);
  }
  identifiers.add(identifier);
};

const renderLanguageLoaderAsync =
  (
    loadedTranslation: LoadedTranslation,
    identifiersByLang: Map<string, Set<string>>,
  ) =>
  (lang: string) => {
    const identifier = createIdentifier(lang, loadedTranslation);
    addIdentifier(identifiersByLang, lang, identifier.virtualUrl);

    return /* ts */ `createLanguage(
      ${JSON.stringify(identifier.registryId)},
      () => import(${JSON.stringify(getPreloadModuleId(lang))})
    )`.trim();
  };

const createIdentifier = (
  lang: string,
  loadedTranslation: LoadedTranslation,
) => {
  const languageTranslations = loadedTranslation.languages[lang] ?? {};

  const langJson: TranslationMessagesByKey = {};

  for (const key of loadedTranslation.keys) {
    langJson[key] = languageTranslations[key].message;
  }

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  const registryId = `vocab:${lang}:${base64}`;

  return {
    registryId,
    virtualUrl: `${virtualModuleId}-${lang}.json?${registryIdQueryKey}${encodeURIComponent(registryId)}&${sourceQueryKey}${base64}`,
  };
};

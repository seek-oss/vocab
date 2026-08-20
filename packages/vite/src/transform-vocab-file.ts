import { createHash } from 'node:crypto';
import { relative, sep } from 'node:path';

import {
  getDevLanguageFileFromTsFile,
  type LoadedTranslation,
  loadTranslation,
  type TranslationMessagesByKey,
  type UserConfig,
} from '@vocab/core';

import * as esModuleLexer from 'es-module-lexer';
import * as cjsModuleLexer from 'cjs-module-lexer';

import { getPreloadModuleId, sourceQueryKey, virtualModuleId } from './consts';

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
    id,
    projectRoot,
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

const renderLanguageLoaderAsync =
  (
    loadedTranslation: LoadedTranslation,
    filePath: string,
    projectRoot: string,
    identifiersByLang: Map<string, Set<string>>,
  ) =>
  (lang: string) => {
    const { moduleId, importId } = createIdentifier(
      lang,
      loadedTranslation,
      filePath,
      projectRoot,
    );

    let identifiers = identifiersByLang.get(lang);
    if (!identifiers) {
      identifiers = new Set();
      identifiersByLang.set(lang, identifiers);
    }
    identifiers.add(importId);

    return /* ts */ `createLanguage(${JSON.stringify(
      moduleId,
    )}, () => import(${JSON.stringify(getPreloadModuleId(lang))}))`.trim();
  };

/**
 * Produces a short, stable id for a translation file so that language modules
 * sharing a language (but originating from different `.vocab` files) don't
 * collide in the runtime translation registry.
 *
 * The registry key must not include `?source=`. Vite treats that query as a
 * module specifier and collapses `createLanguage(id, () => import(preload))`
 * into a one-argument loader.
 */
export const hashFilePath = (filePath: string, projectRoot: string) => {
  const projectRelativePath = relative(projectRoot, filePath)
    .split(sep)
    .join('/');

  return createHash('sha256')
    .update(projectRelativePath)
    .digest('hex')
    .slice(0, 8);
};

const createIdentifier = (
  lang: string,
  loadedTranslation: LoadedTranslation,
  filePath: string,
  projectRoot: string,
) => {
  const languageTranslations = loadedTranslation.languages[lang] ?? {};

  const langJson: TranslationMessagesByKey = {};

  for (const key of loadedTranslation.keys) {
    langJson[key] = languageTranslations[key].message;
  }

  const base64 = Buffer.from(JSON.stringify(langJson), 'utf-8').toString(
    'base64',
  );

  // `.js` not `.json`: static preload imports of `*.json` are claimed by Vite's
  // JSON plugin and never evaluate our registry side effect.
  const moduleId = `${virtualModuleId}-${lang}-${hashFilePath(
    filePath,
    projectRoot,
  )}.js`;
  const importId = `${moduleId}${sourceQueryKey}${base64}`;

  return { moduleId, importId };
};

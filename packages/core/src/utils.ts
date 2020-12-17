import { TranslationKey } from './../../types/src/index';
import path from 'path';

import glob from 'fast-glob';

import type {
  LanguageName,
  LanguageTarget,
  LoadedTranslation,
  TranslationsByLanguage,
  TranslationsByKey,
  TranslationMessagesByKey,
  UserConfig,
} from '@vocab/types';
import { trace } from './logger';
import chalk from 'chalk';

const defaultTranslationDirSuffix = '.vocab';
export const devTranslationFileName = 'translations.json';

type Fallback = 'none' | 'valid' | 'all';

export function isDevLanguageFile(filePath: string) {
  return (
    filePath.endsWith(`/${devTranslationFileName}`) ||
    filePath === devTranslationFileName
  );
}
export function isAltLanguageFile(filePath: string) {
  return filePath.endsWith('.translations.json');
}
export function isTranslationDirectory(
  filePath: string,
  {
    translationsDirectorySuffix = defaultTranslationDirSuffix,
  }: {
    translationsDirectorySuffix?: string;
  },
) {
  return filePath.endsWith(translationsDirectorySuffix);
}

export function getTranslationFolderGlob({
  translationsDirectorySuffix = defaultTranslationDirSuffix,
}: {
  translationsDirectorySuffix?: string;
}) {
  const result = `**/*${translationsDirectorySuffix}`;

  trace('getTranslationFolderGlob', result);

  return result;
}

export function getDevTranslationFileGlob({
  translationsDirectorySuffix = defaultTranslationDirSuffix,
}: {
  translationsDirectorySuffix?: string;
}) {
  const result = `**/*${translationsDirectorySuffix}/${devTranslationFileName}`;

  trace('getDevTranslationFileGlob', result);

  return result;
}

export function getAltTranslationFileGlob(config: UserConfig) {
  const altLanguages = getAltLanguages(config);
  const langMatch =
    altLanguages.length === 1 ? altLanguages[0] : `{${altLanguages.join(',')}}`;

  const { translationsDirectorySuffix = defaultTranslationDirSuffix } = config;
  const result = `**/*${translationsDirectorySuffix}/${langMatch}.translations.json`;

  trace('getAltTranslationFileGlob', result);

  return result;
}

export function getUniqueKey(key: string, namespace: string) {
  return `${key}.${namespace}`;
}

export function getAltLanguages({
  devLanguage,
  languages,
}: {
  devLanguage: LanguageName;
  languages: Array<LanguageTarget>;
}) {
  return languages.map((v) => v.name).filter((lang) => lang !== devLanguage);
}

function getLanguageFallbacks({
  languages,
}: {
  languages: Array<LanguageTarget>;
}) {
  const languageFallbackMap = new Map<LanguageName, LanguageName>();

  for (const lang of languages) {
    if (lang.extends) {
      languageFallbackMap.set(lang.name, lang.extends);
    }
  }

  return languageFallbackMap;
}

export function getLanguageHierarcy({
  languages,
}: {
  languages: Array<LanguageTarget>;
}) {
  const hierarchyMap = new Map<LanguageName, Array<LanguageName>>();
  const fallbacks = getLanguageFallbacks({ languages });

  for (const lang of languages) {
    const langHierachy = [];

    let currLang = lang.extends;

    while (currLang) {
      langHierachy.push(currLang);

      currLang = fallbacks.get(currLang);
    }

    hierarchyMap.set(lang.name, langHierachy);
  }

  return hierarchyMap;
}

export function getDevLanguageFileFromTsFile(tsFilePath: string) {
  const directory = path.dirname(tsFilePath);
  const result = path.normalize(path.join(directory, devTranslationFileName));

  trace(`Returning dev language path ${result} for path ${tsFilePath}`);
  return result;
}

export function getDevLanguageFileFromAltLanguageFile(
  altLanguageFilePath: string,
) {
  const directory = path.dirname(altLanguageFilePath);
  const result = path.normalize(path.join(directory, devTranslationFileName));
  trace(
    `Returning dev language path ${result} for path ${altLanguageFilePath}`,
  );
  return result;
}

export function getTSFileFromDevLanguageFile(devLanguageFilePath: string) {
  const directory = path.dirname(devLanguageFilePath);
  const result = path.normalize(path.join(directory, 'index.ts'));

  trace(`Returning TS path ${result} for path ${devLanguageFilePath}`);
  return result;
}

export function getAltLanguageFilePath(
  devLanguageFilePath: string,
  language: string,
) {
  const directory = path.dirname(devLanguageFilePath);
  const result = path.normalize(
    path.join(directory, `${language}.translations.json`),
  );
  trace(
    `Returning alt language path ${result} for path ${devLanguageFilePath}`,
  );
  return path.normalize(result);
}

function mergeWithDevLanguage(
  translation: TranslationsByKey,
  devTranslation: TranslationsByKey,
) {
  // Only use keys from the dev translation
  const keys = Object.keys(devTranslation);
  const newLanguage: TranslationsByKey = {};
  for (const key of keys) {
    if (translation[key]) {
      newLanguage[key] = {
        message: translation[key].message,
        description: devTranslation[key].description,
      };
    }
  }
  return newLanguage;
}

function loadAltLanguageFile(
  {
    filePath,
    languageName,
    devTranslation,
    fallbacks,
  }: {
    filePath: string;
    languageName: string;
    devTranslation: TranslationsByKey;
    fallbacks: Fallback;
  },
  { devLanguage, languages }: UserConfig,
): TranslationsByKey {
  const result = {};

  const languageHierarchy = getLanguageHierarcy({ languages }).get(
    languageName,
  );

  if (!languageHierarchy) {
    throw new Error(`Missing language hierarchy for ${languageName}`);
  }

  const fallbackLanguages: Array<string> = [languageName];

  if (fallbacks !== 'none') {
    fallbackLanguages.unshift(...languageHierarchy);

    if (fallbacks === 'all' && fallbackLanguages[0] !== devLanguage) {
      fallbackLanguages.unshift(devLanguage);
    }
  }

  trace(
    `Loading alt language file with precendence: ${fallbackLanguages
      .slice()
      .reverse()
      .join(' -> ')}`,
  );

  for (const fallbackLang of fallbackLanguages) {
    if (fallbackLang !== devLanguage) {
      try {
        const altFilePath = getAltLanguageFilePath(filePath, fallbackLang);
        delete require.cache[altFilePath];

        const translationFile = require(altFilePath);
        const { keys } = getTranslationsFromFile(translationFile, {
          filePath: altFilePath,
          isAltLanguage: true,
        });
        Object.assign(result, mergeWithDevLanguage(keys, devTranslation));
      } catch (e) {
        trace(`Missing alt language file ${getAltLanguageFilePath(
          filePath,
          fallbackLang,
        )}
        `);
      }
    } else {
      Object.assign(result, devTranslation);
    }
  }

  return result;
}

function getNamespaceByFilePath(
  relativePath: string,
  { translationsDirectorySuffix = defaultTranslationDirSuffix }: UserConfig,
) {
  let namespace = path
    .dirname(relativePath)
    .replace(/^src\//, '')
    .replace(/\//g, '_');

  if (namespace.endsWith(translationsDirectorySuffix)) {
    namespace = namespace.slice(0, -translationsDirectorySuffix.length);
  }

  return namespace;
}

function printValidationError(...params: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(chalk.red('Error loading translation:'), ...params);
}

function getTranslationsFromFile(
  translations: unknown,
  { isAltLanguage, filePath }: { isAltLanguage: boolean; filePath: string },
): { $namespace: unknown; keys: TranslationsByKey } {
  if (!translations || typeof translations !== 'object') {
    throw new Error(
      `Unable to read translation file ${filePath}. Translations must be an object`,
    );
  }
  const { $namespace, ...keys } = translations as TranslationsByKey;
  if (isAltLanguage && $namespace) {
    printValidationError(
      `Found $namespace in alt language file in ${filePath}. $namespace is only used in the dev language and will be ignored.`,
    );
  }
  if (!isAltLanguage && $namespace && typeof $namespace !== 'string') {
    printValidationError(
      `Found non-string $namespace in language file in ${filePath}. $namespace must be a string.`,
    );
  }
  const validKeys: TranslationsByKey = {};
  for (const [translationKey, translation] of Object.entries(keys)) {
    if (typeof translation === 'string') {
      printValidationError(
        `Found string for a translation "${translationKey}" in ${filePath}. Translation must be an object of the format {mesage: string}.`,
      );
      continue;
    }
    if (!translation) {
      printValidationError(
        `Found empty translation "${translationKey}" in ${filePath}. Translation must be an object of the format {mesage: string}.`,
      );
      continue;
    }
    if (!translation.message || typeof translation.message !== 'string') {
      printValidationError(
        `No message found for translation "${translationKey}" in ${filePath}. Translation must be an object of the format {mesage: string}.`,
      );
      continue;
    }
    validKeys[translationKey] = translation;
  }
  return { $namespace, keys: validKeys };
}

export function loadTranslation(
  {
    filePath,
    fallbacks,
  }: {
    filePath: string;
    fallbacks: Fallback;
  },
  userConfig: UserConfig,
): LoadedTranslation {
  trace(
    `Loading translation file in "${fallbacks}" fallback mode: "${filePath}"`,
  );

  const languageSet: Record<
    string,
    Record<string, { message: string; description?: string | undefined }>
  > = {};

  delete require.cache[filePath];
  const translationContent = require(filePath);
  const relativePath = path.relative(
    userConfig.projectRoot || process.cwd(),
    filePath,
  );
  const { $namespace, keys: devTranslation } = getTranslationsFromFile(
    translationContent,
    {
      filePath,
      isAltLanguage: false,
    },
  );
  const namespace: string =
    typeof $namespace === 'string'
      ? $namespace
      : getNamespaceByFilePath(relativePath, userConfig);

  trace(`Found file ${filePath}. Using namespace ${namespace}`);

  languageSet[userConfig.devLanguage] = devTranslation;
  const altLanguages = getAltLanguages(userConfig);
  for (const languageName of altLanguages) {
    languageSet[languageName] = loadAltLanguageFile(
      {
        filePath,
        languageName,
        devTranslation,
        fallbacks,
      },
      userConfig,
    );
  }

  return {
    filePath,
    keys: Object.keys(devTranslation),
    namespace,
    relativePath,
    languages: languageSet,
  };
}

export async function loadAllTranslations(
  {
    fallbacks,
    includeNodeModules,
  }: { fallbacks: Fallback; includeNodeModules: boolean },
  config: UserConfig,
): Promise<Array<LoadedTranslation>> {
  const { projectRoot, ignore = [] } = config;

  const translationFiles = await glob(getDevTranslationFileGlob(config), {
    ignore: includeNodeModules ? ignore : [...ignore, '**/node_modules/**'],
    absolute: true,
    cwd: projectRoot,
  });

  trace(`Found ${translationFiles.length} translation files`);

  const result = await Promise.all(
    translationFiles.map((filePath) =>
      loadTranslation({ filePath, fallbacks }, config),
    ),
  );
  const keys = new Set();
  for (const loadedTranslation of result) {
    for (const key of loadedTranslation.keys) {
      const uniqueKey = getUniqueKey(key, loadedTranslation.namespace);
      if (keys.has(uniqueKey)) {
        trace(`Duplicate keys found`);
        throw new Error(
          `Duplicate keys found. Key with namespace ${loadedTranslation.namespace} and key ${key} was found multiple times.`,
        );
      }
      keys.add(uniqueKey);
    }
  }
  return result;
}

export function mapValues<Key extends string, OriginalValue, ReturnValue>(
  obj: Record<Key, OriginalValue>,
  func: (val: OriginalValue) => ReturnValue,
): TranslationMessagesByKey<Key> {
  const newObj: any = {};
  const keys = Object.keys(obj) as Key[];
  for (const key of keys) {
    newObj[key] = func(obj[key]);
  }
  return newObj;
}

export function getTranslationMessages<Key extends string>(
  translations: TranslationsByKey<Key>,
): TranslationMessagesByKey<Key> {
  return mapValues(translations, (v) => v.message);
}

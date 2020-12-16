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

export function getDevTranslationFileGlob({
  translationsDirectorySuffix = defaultTranslationDirSuffix,
}: {
  translationsDirectorySuffix?: string;
}) {
  const result = `**/*${translationsDirectorySuffix}/${devTranslationFileName}`;

  trace('getDevTranslationFileGlob', result);

  return result;
}

export function getAltTranslationFileGlob({
  translationsDirectorySuffix = defaultTranslationDirSuffix,
  languages,
  devLanguage,
}: UserConfig) {
  const langMatch = languages
    .map(({ name }) => name)
    .filter((lang) => lang !== devLanguage)
    .join(',');

  const result = `**/*${translationsDirectorySuffix}/{${langMatch}}.json`;

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
  translation: TranslationsByLanguage,
  devTranslation: TranslationsByLanguage,
) {
  // Only use keys from the dev translation
  const keys = Object.keys(devTranslation);
  const newLanguage: TranslationsByLanguage = {};
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
    devTranslation: TranslationsByLanguage;
    fallbacks: Fallback;
  },
  { devLanguage, languages }: UserConfig,
) {
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
        Object.assign(
          result,
          mergeWithDevLanguage(translationFile, devTranslation),
        );
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
  const { $namespace, ...devTranslation } = translationContent;
  const namespace =
    $namespace || getNamespaceByFilePath(relativePath, userConfig);

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

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

const defaultTranslationDirname = '__translations__';

export const translationFileExtension = 'translations.json';

type Fallback = 'none' | 'valid' | 'all';

export function getDevTranslationFileGlob({
  translationsDirname = defaultTranslationDirname,
}: {
  translationsDirname?: string;
}) {
  return `**/${translationsDirname}/?(*.)translations.json`;
}

export function getAltTranslationFileGlob({
  translationsDirname = defaultTranslationDirname,
}: {
  translationsDirname?: string;
}) {
  return `**/${translationsDirname}/?(*.)translations.*.json`;
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

export function getDevLanguageFileFromTsFile(
  tsFilePath: string,
  {
    translationsDirname = defaultTranslationDirname,
  }: { translationsDirname?: string },
) {
  const directory = path.dirname(tsFilePath);
  const basename = path.basename(tsFilePath);
  const jsonFileName = basename.replace(
    /translations\.ts$/,
    translationFileExtension,
  );

  const result = path.join(directory, translationsDirname, jsonFileName);
  trace(`Returning dev language path ${result} for path ${tsFilePath}`);
  return path.normalize(result);
}

export function getTSFileFromDevLanguageFile(devLanguageFilePath: string) {
  const result = path.join(
    path.dirname(devLanguageFilePath),
    '..',
    path.basename(devLanguageFilePath, '.json').concat('.ts'),
  );

  trace(`Returning TS path ${result} for path ${devLanguageFilePath}`);
  return path.normalize(result);
}

export function getAltLanguageFilePath(
  devLanguageFilePath: string,
  language: string,
) {
  const result = devLanguageFilePath.replace(
    /translations\.json$/,
    `translations.${language}.json`,
  );
  trace(
    `Returning alt language path ${result} for path ${devLanguageFilePath}`,
  );
  return path.normalize(result);
}

export async function getAllTranslationFiles({
  projectRoot,
  translationsDirname,
}: {
  translationsDirname?: string;
  projectRoot?: string;
}) {
  const translationFileGlob = getDevTranslationFileGlob({
    translationsDirname,
  });
  trace(`Looking for translation files with ${translationFileGlob}`);
  const translationFiles = await glob(translationFileGlob, {
    cwd: projectRoot,
  });
  trace(`Found ${translationFiles.length} translation files`);

  return translationFiles;
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

function getNamespaceByFilePath(relativePath: string) {
  return relativePath
    .replace(/^src\//, '')
    .replace(/\.?translations\.json$/, '')
    .replace(/\//g, '_');
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
  const namespace = $namespace || getNamespaceByFilePath(relativePath);

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
  { fallbacks }: { fallbacks: Fallback },
  { projectRoot, devLanguage, languages, translationsDirname }: UserConfig,
): Promise<Array<LoadedTranslation>> {
  const translationFiles = await glob(
    getDevTranslationFileGlob({ translationsDirname }),
    {
      absolute: true,
      cwd: projectRoot,
    },
  );

  trace(`Found ${translationFiles.length} translation files`);

  const result = await Promise.all(
    translationFiles.map((filePath) =>
      loadTranslation(
        { filePath, fallbacks },
        {
          devLanguage,
          languages,
          translationsDirname,
        },
      ),
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

import path from 'path';

import glob from 'fast-glob';

import type {
  LanguageName,
  LanguageTarget,
  LoadedTranslation,
  TranslationsByLanguage,
  UserConfig,
} from '@vocab/types';

const defaultTranslationDirname = '__translations__';

type Fallback = 'none' | 'valid' | 'all';

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

export function getAltLanguageFilePath(
  filePath: string,
  language: string,
  {
    translationsDirname = defaultTranslationDirname,
  }: { translationsDirname?: string },
) {
  const directory = path.dirname(filePath);
  const [fileIdentifier] = path.basename(filePath).split('.translations.json');

  return path.join(
    directory,
    translationsDirname,
    `${fileIdentifier}.translations.${language}.json`,
  );
}

export async function getAllTranslationFiles({
  projectRoot,
}: {
  projectRoot?: string;
}) {
  const translationFiles = await glob('**/*.translations.json', {
    cwd: projectRoot,
  });

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
  { devLanguage, languages, translationsDirname }: UserConfig,
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

  for (const fallbackLang of fallbackLanguages) {
    if (fallbackLang !== devLanguage) {
      try {
        const altFilePath = getAltLanguageFilePath(filePath, fallbackLang, {
          translationsDirname,
        });
        delete require.cache[altFilePath];

        const translationFile = require(altFilePath);
        Object.assign(
          result,
          mergeWithDevLanguage(translationFile, devTranslation),
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(
          'Missing alt language file',
          getAltLanguageFilePath(filePath, fallbackLang, {
            translationsDirname,
          }),
        );
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
    .replace(/\.translations\.json$/, '')
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
  const languageSet = new Map();

  delete require.cache[filePath];
  const translationContent = require(filePath);
  const relativePath = path.relative(
    userConfig.projectRoot || process.cwd(),
    filePath,
  );
  const { $namespace, ...devTranslation } = translationContent;
  const namespace = $namespace || getNamespaceByFilePath(relativePath);

  languageSet.set(userConfig.devLanguage, devTranslation);
  const altLanguages = getAltLanguages(userConfig);
  for (const languageName of altLanguages) {
    languageSet.set(
      languageName,
      loadAltLanguageFile(
        {
          filePath,
          languageName,
          devTranslation,
          fallbacks,
        },
        userConfig,
      ),
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
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
    cwd: projectRoot,
  });
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
        throw new Error(
          `Duplicate keys found. Key with namespace ${loadedTranslation.namespace} and key ${key} was found multiple times.`,
        );
      }
      keys.add(uniqueKey);
    }
  }
  return result;
}

export function getTranslationKeys(
  translation: LoadedTranslation,
  { devLanguage }: { devLanguage: LanguageName },
) {
  const language = translation.languages.get(devLanguage);

  if (!language) {
    throw new Error('No default language loaded');
  }

  return Object.keys(language);
}

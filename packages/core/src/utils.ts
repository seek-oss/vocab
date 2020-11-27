import path from 'path';

import glob from 'fast-glob';

import { resolveConfig } from './config';
import type {
  LanguageName,
  LanguageTarget,
  LoadedTranslation,
  TranslationsByLanguage,
  UserConfig,
} from '@vocab/types';

const defaultTranslationDirname = '__translations__';

export { resolveConfig };

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
    useFallbacks,
  }: {
    filePath: string;
    languageName: string;
    devTranslation: TranslationsByLanguage;
    useFallbacks: boolean;
  },
  { devLanguage, languages, translationsDirname }: UserConfig,
) {
  const result = {};
  if (useFallbacks) {
    Object.assign(result, devTranslation);
  }

  const langHierarchy = useFallbacks
    ? getLanguageHierarcy({ languages }).get(languageName)
    : [];

  if (!langHierarchy) {
    throw new Error(`Missing language hierarchy for ${languageName}`);
  }

  for (const fallbackLang of [...langHierarchy, languageName]) {
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
    }
  }

  return result;
}

export function loadTranslation(
  {
    filePath,
    useFallbacks,
  }: {
    filePath: string;
    useFallbacks: boolean;
  },
  userConfig: UserConfig,
): LoadedTranslation {
  const languageSet = new Map();

  delete require.cache[filePath];
  const devTranslation = require(filePath);

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
          useFallbacks,
        },
        userConfig,
      ),
    );
  }

  return {
    filePath,
    relativePath: path.relative(
      userConfig.projectRoot || process.cwd(),
      filePath,
    ),
    languages: languageSet,
  };
}

export async function loadAllTranslations(
  { useFallbacks }: { useFallbacks: boolean },
  { projectRoot, devLanguage, languages, translationsDirname }: UserConfig,
) {
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
    cwd: projectRoot,
  });
  return Promise.all(
    translationFiles.map((filePath) =>
      loadTranslation(
        { filePath, useFallbacks },
        {
          devLanguage,
          languages,
          translationsDirname,
        },
      ),
    ),
  );
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

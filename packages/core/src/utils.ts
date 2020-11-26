import path from 'path';

import glob from 'fast-glob';

import { resolveConfig } from './config';
import { LanguageTarget, UserConfig } from '@vocab/types';

const defaultTranslationDirname = '__translations__';

type LanguageName = string;

type TranslationFile = Record<
  string,
  {
    message: string;
    description?: string;
  }
>;

type LoadedTranslation = {
  filePath: string;
  relativePath: string;
  languages: Map<LanguageName, TranslationFile>;
};

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

export function getChunkName(lang: string) {
  return `${lang}-translations`;
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
  translation: TranslationFile,
  devTranslation: TranslationFile,
) {
  // Only use keys from the dev translation
  const keys = Object.keys(devTranslation);
  const newLanguage: TranslationFile = {};
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
  filePath: string,
  lang: string,
  devTranslation: TranslationFile,
  useFallbacks: boolean,
  { devLanguage, languages, translationsDirname }: UserConfig,
) {
  const result = {};
  if (useFallbacks) {
    Object.assign(result, devTranslation);
  }

  const langHierarchy = useFallbacks
    ? getLanguageHierarcy({ languages }).get(lang)
    : [];

  if (!langHierarchy) {
    throw new Error(`Missing language hierarchy for ${lang}`);
  }

  for (const fallbackLang of [...langHierarchy, lang]) {
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
  filePath: string,
  useFallbacks: boolean,
  userConfig: UserConfig,
): LoadedTranslation {
  const languageSet = new Map();

  delete require.cache[filePath];
  const devTranslation = require(filePath);

  languageSet.set(userConfig.devLanguage, devTranslation);
  const altLanguages = userConfig.devLanguage;
  for (const lang of altLanguages) {
    languageSet.set(
      lang,
      loadAltLanguageFile(
        filePath,
        lang,
        devTranslation,
        useFallbacks,
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
  useFallbacks: boolean,
  { projectRoot, devLanguage, languages, translationsDirname }: UserConfig,
) {
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
    cwd: projectRoot,
  });
  return Promise.all(
    translationFiles.map((v) =>
      loadTranslation(v, useFallbacks, {
        devLanguage,
        languages,
        translationsDirname,
      }),
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

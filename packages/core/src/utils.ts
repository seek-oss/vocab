import path from 'path';

import glob from 'fast-glob';

import { resolveConfig, LanguageTarget } from './config';

type LanguageName = string;

type LoadedTranslation = {
  filePath: string;
  languages: Map<
    LanguageName,
    Record<
      string,
      {
        message: string;
      }
    >
  >;
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
  { translationsDirname }: { translationsDirname: string },
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

function loadAltLanguageFile(
  filePath: string,
  lang: string,
  {
    devLanguage,
    languages,
    translationsDirname,
  }: {
    devLanguage: LanguageName;
    languages: Array<LanguageTarget>;
    translationsDirname: string;
  },
) {
  let result = require(filePath);

  const langHierarchy = getLanguageHierarcy({ languages }).get(lang);

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

        result = {
          ...result,
          ...require(altFilePath),
        };
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
  {
    devLanguage,
    languages,
    translationsDirname,
  }: {
    devLanguage: LanguageName;
    languages: Array<LanguageTarget>;
    translationsDirname: string;
  },
): LoadedTranslation {
  const languageSet = new Map();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  languageSet.set(devLanguage, require(filePath));
  const altLanguages = devLanguage;
  for (const lang of altLanguages) {
    languageSet.set(
      lang,
      loadAltLanguageFile(filePath, lang, {
        devLanguage,
        translationsDirname,
        languages,
      }),
    );
  }

  return {
    filePath,
    languages: languageSet,
  };
}

export async function loadAllTranslations({
  projectRoot,
  devLanguage,
  languages,
  translationsDirname,
}: {
  projectRoot?: string;
  devLanguage: LanguageName;
  languages: Array<LanguageTarget>;
  translationsDirname: string;
}) {
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
    cwd: projectRoot,
  });

  return Promise.all(
    translationFiles.map((v) =>
      loadTranslation(v, { devLanguage, languages, translationsDirname }),
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

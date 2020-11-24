import path from 'path';

import glob from 'fast-glob';

import { loadConfig, getConfig } from './getConfig';

type LangaugeName = string;

type LoadedTranslation = {
  filePath: string;
  languages: Map<
    LangaugeName,
    Record<
      string,
      {
        message: string;
      }
    >
  >;
};

export { loadConfig };

export function getDevLanguage() {
  return getConfig().devLanguage;
}

export function getAltLanguages() {
  return getConfig()
    .languages.map((v) => v.name)
    .filter((lang) => lang !== getDevLanguage());
}

function getLanguageFallbacks() {
  const languageFallbackMap = new Map<LangaugeName, LangaugeName>();

  for (const lang of getConfig().languages) {
    if (lang.extends) {
      languageFallbackMap.set(lang.name, lang.extends);
    }
  }

  return languageFallbackMap;
}

export function getLanguageHierarcy() {
  const hierarchyMap = new Map<LangaugeName, Array<LangaugeName>>();
  const fallbacks = getLanguageFallbacks();

  for (const lang of getConfig().languages) {
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

export function getAltLanguageFilePath(filePath: string, language: string) {
  const directory = path.dirname(filePath);
  const [fileIdentifier] = path.basename(filePath).split('.translations.json');

  return path.join(
    directory,
    getConfig().translationsDirname,
    `${fileIdentifier}.translations.${language}.json`,
  );
}

export async function getAllTranslationFiles() {
  const translationFiles = await glob('**/*.translations.json', {
    cwd: getConfig().cwd,
  });

  return translationFiles;
}

function loadAltLanguageFile(filePath: string, lang: string) {
  let result = require(filePath);

  const langHierarchy = getLanguageHierarcy().get(lang);

  if (!langHierarchy) {
    throw new Error(`Missing language hierarchy for ${lang}`);
  }

  for (const fallbackLang of [...langHierarchy, lang]) {
    if (fallbackLang !== getDevLanguage()) {
      try {
        const altFilePath = getAltLanguageFilePath(filePath, fallbackLang);
        delete require.cache[altFilePath];

        result = {
          ...result,
          ...require(altFilePath),
        };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(
          'Missing alt language file',
          getAltLanguageFilePath(filePath, fallbackLang),
        );
      }
    }
  }

  return result;
}

export function loadTranslation(filePath: string): LoadedTranslation {
  const languages = new Map();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  languages.set(getConfig().devLanguage, require(filePath));
  const altLanguages = getAltLanguages();
  for (const lang of altLanguages) {
    languages.set(lang, loadAltLanguageFile(filePath, lang));
  }

  return {
    filePath,
    languages,
  };
}

export async function loadAllTranslations() {
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
    cwd: getConfig().cwd,
  });

  return Promise.all(translationFiles.map(loadTranslation));
}

export function getTranslationKeys(translation: LoadedTranslation) {
  const language = translation.languages.get(getDevLanguage());

  if (!language) {
    throw new Error('No default language loaded');
  }

  return Object.keys(language);
}

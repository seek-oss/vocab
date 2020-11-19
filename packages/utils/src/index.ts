import path from 'path';

import glob from 'fast-glob';

type LoadedTranslation = {
  filePath: string;
  languages: Map<
    string,
    Record<
      string,
      {
        message: string;
      }
    >
  >;
};

const defaultLanguage = 'en';
const altLanguages = ['th'];
const translationDirname = '__translations__';

export function getDefaultLanguage() {
  return defaultLanguage;
}

export function getAltLanguages() {
  return altLanguages;
}

export function getChunkName(lang: string) {
  return `${lang}-translations`;
}

export function getAltLanguageFilePath(filePath: string, language: string) {
  const directory = path.dirname(filePath);
  const [fileIdentifier] = path.basename(filePath).split('.translations.json');

  return path.join(
    directory,
    translationDirname,
    `${fileIdentifier}.translations.${language}.json`,
  );
}

export async function getAllTranslationFiles() {
  const translationFiles = await glob('**/*.translations.json');

  return translationFiles;
}

export function loadTranslation(filePath: string): LoadedTranslation {
  const languages = new Map();

  languages.set(defaultLanguage, require(filePath));

  for (const lang of altLanguages) {
    try {
      languages.set(lang, require(getAltLanguageFilePath(filePath, lang)));
    } catch (e) {
      console.log(
        'Ignore missing alt-language file',
        getAltLanguageFilePath(filePath, lang),
      );
    }
  }

  return {
    filePath,
    languages,
  };
}

export async function loadAllTranslations() {
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
  });

  return translationFiles.map(loadTranslation);
}

export function getTranslationKeys(translation: LoadedTranslation) {
  const language = translation.languages.get(getDefaultLanguage());

  if (!language) {
    throw new Error('No default language loaded');
  }

  return Object.keys(language);
}

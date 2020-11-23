import path from 'path';

import glob from 'fast-glob';

import { loadConfig, getConfig } from './getConfig';

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

export { loadConfig };

export function getDefaultLanguage() {
  return getConfig().defaultLanguage;
}

export function getAltLanguages() {
  return getConfig().altLanguages;
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
  const translationFiles = await glob('**/*.translations.json');

  return translationFiles;
}

export function loadTranslation(filePath: string): LoadedTranslation {
  const languages = new Map();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  languages.set(getConfig().defaultLanguage, require(filePath));
  const altLanguages = getAltLanguages();
  for (const lang of altLanguages) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      languages.set(lang, require(getAltLanguageFilePath(filePath, lang)));
    } catch (e) {
      // eslint-disable-next-line no-console
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
    cwd: getConfig().cwd,
  });

  return Promise.all(translationFiles.map(loadTranslation));
}

export function getTranslationKeys(translation: LoadedTranslation) {
  const language = translation.languages.get(getDefaultLanguage());

  if (!language) {
    throw new Error('No default language loaded');
  }

  return Object.keys(language);
}

import path from 'path';

import glob from 'fast-glob';
import findUp from 'find-up';

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

interface Config {
  defaultLanguage: string;
  altLanguages: Array<string>;
  translationDirName: string;
}

let configPromise: Promise<Config> | null = null;

function validationError(...params: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(...params);
  process.exit(1);
}

async function getConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = findUp('vocab.config.js').then((configFilePath) => {
      if (!configFilePath) {
        validationError('Unable to find a project vocab.config.js');
      }
      const result: Config = require(configFilePath!);
      if (!result.defaultLanguage) {
        validationError(
          `No defaultLanguage found in vocab.config.js at ${configFilePath}`,
        );
      }
      if (!result.altLanguages) {
        validationError(
          `No altLanguages found in vocab.config.js at ${configFilePath}`,
        );
      }
      if (!result.translationDirName) {
        validationError(
          `No translationDirName found in vocab.config.js at ${configFilePath}`,
        );
      }
      return result;
    });
  }
  return configPromise;
}

export async function getDefaultLanguage() {
  return (await getConfig()).defaultLanguage;
}

export async function getAltLanguages() {
  return (await getConfig()).altLanguages;
}

export function getChunkName(lang: string) {
  return `${lang}-translations`;
}

export async function getAltLanguageFilePath(
  filePath: string,
  language: string,
) {
  const directory = path.dirname(filePath);
  const [fileIdentifier] = path.basename(filePath).split('.translations.json');

  return path.join(
    directory,
    (await getConfig()).translationDirName,
    `${fileIdentifier}.translations.${language}.json`,
  );
}

export async function getAllTranslationFiles() {
  const translationFiles = await glob('**/*.translations.json');

  return translationFiles;
}

export async function loadTranslation(
  filePath: string,
): Promise<LoadedTranslation> {
  const languages = new Map();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  languages.set((await getConfig()).defaultLanguage, require(filePath));
  const altLanguages = await getAltLanguages();
  for (const lang of altLanguages) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      languages.set(
        lang,
        require(await getAltLanguageFilePath(filePath, lang)),
      );
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
  });

  return Promise.all(translationFiles.map(loadTranslation));
}

export async function getTranslationKeys(translation: LoadedTranslation) {
  const language = translation.languages.get(await getDefaultLanguage());

  if (!language) {
    throw new Error('No default language loaded');
  }

  return Object.keys(language);
}

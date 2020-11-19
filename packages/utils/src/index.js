/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const glob = require('fast-glob');

const defaultLanguage = 'en';
const altLanguages = ['th'];
const translationDirname = '__translations__';

function getDefaultLanguage() {
  return defaultLanguage;
}

function getAltLanguages() {
  return altLanguages;
}

function getChunkName(lang) {
  return `${lang}-translations`;
}

function getAltLanguageFilePath(filePath, language) {
  const directory = path.dirname(filePath);
  const [fileIdentifier] = path.basename(filePath).split('.translations.json');

  return path.join(
    directory,
    translationDirname,
    `${fileIdentifier}.translations.${language}.json`,
  );
}

async function getAllTranslationFiles() {
  const translationFiles = await glob('**/*.translations.json');

  return translationFiles;
}

function loadTranslation(filePath) {
  const languages = new Map();

  languages.set(defaultLanguage, require(filePath));

  for (const lang of altLanguages) {
    try {
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

async function loadAllTranslations() {
  const translationFiles = await glob('**/*.translations.json', {
    absolute: true,
  });

  return translationFiles.map(loadTranslation);
}

function getTranslationKeys(translation) {
  return Object.keys(translation.languages.get(getDefaultLanguage()));
}

module.exports = {
  loadAllTranslations,
  getAltLanguageFilePath,
  getAllTranslationFiles,
  loadTranslation,
  getChunkName,
  getDefaultLanguage,
  getAltLanguages,
  getTranslationKeys,
};

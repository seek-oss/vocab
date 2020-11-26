import { promises as fs } from 'fs';
import path from 'path';

import {
  loadAllTranslations,
  getAltLanguageFilePath,
  getAltLanguages,
} from '@vocab/core';
import { UserConfig } from '@vocab/types';

import { callPhrase, getUniqueNameForFile } from './phrase-api';

interface TranslationFile {
  [k: string]: { message: string; description?: string };
}
type Language = string;

async function getAllTranslationsFromPhrase(
  branch: string,
): Promise<Record<Language, TranslationFile>> {
  const phraseResult: Array<{
    key: { name: string };
    locale: { code: string };
    content: string;
  }> = await callPhrase(`translations?branch=${branch}&per_page=100`);
  const translations: Record<Language, TranslationFile> = {};
  for (const r of phraseResult) {
    if (!translations[r.locale.code]) {
      translations[r.locale.code] = {};
    }
    translations[r.locale.code][r.key.name] = { message: r.content };
  }
  return translations;
}

function getPhraseKey(key: string, namespace: string) {
  return `${namespace}-${key}`;
}

interface PullOptions {
  branch?: string;
}
export async function pull(
  { branch = 'local-development' }: PullOptions,
  config: UserConfig,
) {
  const alternativeLanguages = getAltLanguages(config);
  const allPhraseTranslations = await getAllTranslationsFromPhrase(branch);
  const uniqueNames = new Set();

  const allVocabTranslations = await loadAllTranslations(false, config);

  for (const { filePath, relativePath, languages } of allVocabTranslations) {
    const uniqueName = getUniqueNameForFile(relativePath);
    if (uniqueNames.has(uniqueName)) {
      throw new Error(
        'Duplicate unique names found. Improve name hasing algorthym',
      );
    }
    uniqueNames.add(uniqueName);

    const devTranslations = languages.get(config.devLanguage);

    if (!devTranslations) {
      throw new Error('No dev language translations loaded');
    }

    const defaultValues = { ...devTranslations };
    const localKeys = Object.keys(defaultValues);

    for (const key of localKeys) {
      defaultValues[key] = {
        ...defaultValues[key],
        ...allPhraseTranslations[config.devLanguage][
          getPhraseKey(key, uniqueName)
        ],
      };
    }
    await fs.writeFile(filePath, `${JSON.stringify(defaultValues, null, 2)}\n`);

    for (const alternativeLanguage of alternativeLanguages) {
      const altTranslations = { ...languages.get(alternativeLanguage) };
      const phraseAltTranslations = allPhraseTranslations[alternativeLanguage];

      for (const key of localKeys) {
        const phraseTranslationMessage =
          phraseAltTranslations[getPhraseKey(key, uniqueName)].message;

        if (!phraseTranslationMessage) {
          throw new Error('Error. No message on translation');
        }

        altTranslations[key] = {
          ...altTranslations[key],
          message: phraseTranslationMessage,
        };
      }

      const altTranslationFilePath = getAltLanguageFilePath(
        filePath,
        alternativeLanguage,
        config,
      );

      await fs.mkdir(path.dirname(altTranslationFilePath), {
        recursive: true,
      });
      await fs.writeFile(
        altTranslationFilePath,
        `${JSON.stringify(altTranslations, null, 2)}\n`,
      );
    }
  }
}

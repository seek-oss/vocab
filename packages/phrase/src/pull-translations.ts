import { promises as fs } from 'fs';
import path from 'path';

import {
  loadAllTranslations,
  getAltLanguageFilePath,
  getAltLanguages,
  getUniqueKey,
} from '@vocab/core';
import type {
  UserConfig,
  LanguageName,
  TranslationsByLanguage,
} from '@vocab/types';

import { callPhrase, ensureBranch } from './phrase-api';
import { trace } from './logger';

async function getAllTranslationsFromPhrase(
  branch: string,
): Promise<Record<LanguageName, TranslationsByLanguage>> {
  const phraseResult: Array<{
    key: { name: string };
    locale: { code: string };
    content: string;
  }> = await callPhrase(`translations?branch=${branch}&per_page=100`);
  const translations: Record<LanguageName, TranslationsByLanguage> = {};
  for (const r of phraseResult) {
    if (!translations[r.locale.code]) {
      translations[r.locale.code] = {};
    }
    translations[r.locale.code][r.key.name] = { message: r.content };
  }
  return translations;
}
interface PullOptions {
  branch?: string;
}
export async function pull(
  { branch = 'local-development' }: PullOptions,
  config: UserConfig,
) {
  trace(`Pulling translations from branch ${branch}`);
  await ensureBranch(branch);
  const alternativeLanguages = getAltLanguages(config);
  const allPhraseTranslations = await getAllTranslationsFromPhrase(branch);
  trace(
    `Pulling translations from Phrase for languages ${
      config.devLanguage
    } and ${alternativeLanguages.join(', ')}`,
  );

  const allVocabTranslations = await loadAllTranslations(
    { fallbacks: 'none' },
    config,
  );

  for (const loadedTranslation of allVocabTranslations) {
    const devTranslations = loadedTranslation.languages.get(config.devLanguage);

    if (!devTranslations) {
      throw new Error('No dev language translations loaded');
    }

    const defaultValues = { ...devTranslations };
    const localKeys = Object.keys(defaultValues);

    for (const key of localKeys) {
      defaultValues[key] = {
        ...defaultValues[key],
        ...allPhraseTranslations[config.devLanguage][
          getUniqueKey(key, loadedTranslation.namespace)
        ],
      };
    }
    await fs.writeFile(
      loadedTranslation.filePath,
      `${JSON.stringify(defaultValues, null, 2)}\n`,
    );

    for (const alternativeLanguage of alternativeLanguages) {
      const altTranslations = {
        ...loadedTranslation.languages.get(alternativeLanguage),
      };
      const phraseAltTranslations = allPhraseTranslations[alternativeLanguage];

      for (const key of localKeys) {
        const phraseKey = getUniqueKey(key, loadedTranslation.namespace);
        const phraseTranslationMessage =
          phraseAltTranslations[phraseKey]?.message;

        if (!phraseTranslationMessage) {
          trace(
            `Missing translation. No translation for key ${key} in phrase as ${phraseKey} in language ${alternativeLanguage}.`,
          );
          continue;
        }

        altTranslations[key] = {
          ...altTranslations[key],
          message: phraseTranslationMessage,
        };
      }

      const altTranslationFilePath = getAltLanguageFilePath(
        loadedTranslation.filePath,
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

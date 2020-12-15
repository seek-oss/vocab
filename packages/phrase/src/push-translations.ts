import { TranslationsByLanguage } from './../../types/src/index';

import { ensureBranch, pushTranslationsByLocale } from './phrase-api';
import { trace } from './logger';
import { loadAllTranslations, getUniqueKey } from '@vocab/core';
import { UserConfig } from '@vocab/types';

interface PushOptions {
  branch: string;
}

/**
 * Uploading to the Phrase API for each language. Adding a unique namespace to each key using file path they key came from
 */
export async function push({ branch }: PushOptions, config: UserConfig) {
  const allLanguageTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false },
    config,
  );
  trace(`Pushing translations to branch ${branch}`);
  const allLanguages = config.languages.map((v) => v.name);
  await ensureBranch(branch);

  trace(
    `Pushing translations to phrase for languages ${allLanguages.join(', ')}`,
  );

  const phraseTranslations: TranslationsByLanguage = {};

  for (const loadedTranslation of allLanguageTranslations) {
    for (const language of allLanguages) {
      const localTranslations = loadedTranslation.languages[language];
      if (!localTranslations) {
        continue;
      }
      if (!phraseTranslations[language]) {
        phraseTranslations[language] = {};
      }
      for (const localKey of Object.keys(localTranslations)) {
        const phraseKey = getUniqueKey(localKey, loadedTranslation.namespace);
        phraseTranslations[language][phraseKey] = localTranslations[localKey];
      }
    }
  }

  for (const language of allLanguages) {
    if (phraseTranslations[language]) {
      await pushTranslationsByLocale(
        phraseTranslations[language],
        language,
        branch,
      );
    }
  }
}

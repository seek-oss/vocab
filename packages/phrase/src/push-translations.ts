import {
  loadAllTranslations,
  getUniqueKey,
  type TranslationData,
  type TranslationsByLanguage,
  type UserConfig,
} from '@vocab/core';
import {
  ensureBranch,
  deleteUnusedKeys as phraseDeleteUnusedKeys,
  pushTranslations,
} from './phrase-api';
import { trace } from './logger';

interface PushOptions {
  branch: string;
  deleteUnusedKeys?: boolean;
}

/**
 * Uploads translations to the Phrase API for each language.
 * A unique namespace is appended to each key using the file path the key came from.
 */
export async function push(
  { branch, deleteUnusedKeys }: PushOptions,
  config: UserConfig,
) {
  const allLanguageTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
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

      const {
        metadata: { tags: sharedTags = [] },
      } = loadedTranslation;

      for (const localKey of Object.keys(localTranslations)) {
        const { tags = [], ...localTranslation } = localTranslations[localKey];
        if (language === config.devLanguage) {
          (localTranslation as TranslationData).tags = [...tags, ...sharedTags];
        }
        const globalKey =
          loadedTranslation.languages[config.devLanguage][localKey].globalKey;

        const phraseKey =
          globalKey ?? getUniqueKey(localKey, loadedTranslation.namespace);

        phraseTranslations[language][phraseKey] = localTranslation;
      }
    }
  }

  const { devLanguageUploadId } = await pushTranslations(phraseTranslations, {
    devLanguage: config.devLanguage,
    branch,
  });

  if (deleteUnusedKeys) {
    await phraseDeleteUnusedKeys(devLanguageUploadId, branch);
  }
}

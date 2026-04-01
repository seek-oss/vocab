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
  ignore?: string[];
}

/**
 * Uploads translations to the Phrase API for each language.
 * A unique namespace is appended to each key using the file path the key came from.
 */
export async function push(
  { branch, deleteUnusedKeys, ignore }: PushOptions,
  config: UserConfig,
) {
  if (ignore) {
    trace(`ignoring files on paths: ${ignore.join(', ')}`);
  }
  const allLanguageTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
    {
      ...config,
      ignore: [...(config.ignore || []), ...(ignore || [])],
    },
  );
  trace(`Pushing translations to branch ${branch}`);
  const allLanguages = config.languages.map((v) => v.name);
  await ensureBranch(branch);

  trace(
    `Pushing translations to phrase for languages ${allLanguages.join(', ')}`,
  );

  const phraseTranslations: TranslationsByLanguage = {};

  for (const loadedTranslation of allLanguageTranslations) {
    const sync = loadedTranslation.getSyncView();
    const { metadata: { tags: sharedTags = [] } = {} } = sync;

    for (const language of allLanguages) {
      if (!phraseTranslations[language]) {
        phraseTranslations[language] = {};
      }

      for (const localKey of sync.keys) {
        const entry = sync.entries[localKey];
        const messageData = entry?.messages[language];
        if (!messageData) {
          continue;
        }

        const phraseKey =
          entry.globalKey ?? getUniqueKey(localKey, loadedTranslation.namespace);

        const localTranslation: TranslationData = {
          message: messageData.message,
          ...(messageData.validated !== undefined && {
            validated: messageData.validated,
          }),
          ...(language === config.devLanguage && {
            ...(entry.description !== undefined && {
              description: entry.description,
            }),
            ...(entry.globalKey !== undefined && { globalKey: entry.globalKey }),
            tags: [...(entry.tags ?? []), ...sharedTags],
          }),
        };

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

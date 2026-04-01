import { writeFile, mkdir } from './file';
import path from 'path';

import {
  type TranslationFileContents,
  type UserConfig,
  loadAllTranslations,
  getAltLanguageFilePath,
  getAltLanguages,
  getUniqueKey,
} from '@vocab/core';

import { pullAllTranslations, ensureBranch } from './phrase-api';
import { trace } from './logger';

interface PullOptions {
  branch?: string;
  deleteUnusedKeys?: boolean;
  errorOnNoGlobalKeyTranslation?: boolean;
}

export async function pull(
  { branch = 'local-development', errorOnNoGlobalKeyTranslation }: PullOptions,
  config: UserConfig,
) {
  trace(`Pulling translations from branch ${branch}`);
  await ensureBranch(branch);
  const alternativeLanguages = getAltLanguages(config);
  const allPhraseTranslations = await pullAllTranslations(branch);
  trace(
    `Pulling translations from Phrase for languages ${
      config.devLanguage
    } and ${alternativeLanguages.join(', ')}`,
  );

  const phraseLanguages = Object.keys(allPhraseTranslations);
  trace(
    `Found Phrase translations for languages ${phraseLanguages.join(', ')}`,
  );

  if (!phraseLanguages.includes(config.devLanguage)) {
    throw new Error(
      `Phrase did not return any translations for the configured development language "${config.devLanguage}".\nPlease ensure this language is present in your Phrase project's configuration.`,
    );
  }

  const allVocabTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
    config,
  );

  for (const loadedTranslation of allVocabTranslations) {
    const sync = loadedTranslation.getSyncView();

    const defaultValues: TranslationFileContents = {};
    for (const key of sync.keys) {
      const entry = sync.entries[key];
      const messageData = entry?.messages[config.devLanguage];
      if (!messageData) {
        continue;
      }
      defaultValues[key] = {
        message: messageData.message,
        ...(messageData.validated !== undefined && {
          validated: messageData.validated,
        }),
        ...(entry.description !== undefined && {
          description: entry.description,
        }),
        ...(entry.globalKey !== undefined && { globalKey: entry.globalKey }),
        ...(entry.tags !== undefined && { tags: entry.tags }),
      };
    }

    const localKeys = Object.keys(defaultValues).filter((k) => k !== '_meta');

    for (const key of localKeys) {
      const entry = sync.entries[key];
      const phraseKey =
        entry?.globalKey ?? getUniqueKey(key, loadedTranslation.namespace);
      const phraseData =
        allPhraseTranslations[config.devLanguage][phraseKey];
      if (phraseData && defaultValues[key]) {
        defaultValues[key] = {
          ...defaultValues[key],
          ...phraseData,
        };
      }
    }

    // Only write a `_meta` field if necessary
    if (Object.keys(sync.metadata).length > 0) {
      defaultValues._meta = sync.metadata;
    }

    await writeFile(
      loadedTranslation.filePath,
      `${JSON.stringify(defaultValues, null, 2)}\n`,
    );

    for (const alternativeLanguage of alternativeLanguages) {
      if (alternativeLanguage in allPhraseTranslations) {
        const altTranslations: Record<
          string,
          { message: string; validated?: boolean }
        > = {};
        const phraseAltTranslations =
          allPhraseTranslations[alternativeLanguage];

        for (const key of localKeys) {
          const entry = sync.entries[key];
          const phraseKey =
            entry?.globalKey ??
            getUniqueKey(key, loadedTranslation.namespace);
          const phraseTranslationMessage =
            phraseAltTranslations[phraseKey]?.message;

          if (!phraseTranslationMessage) {
            trace(
              `Missing translation. No translation for key ${key} in phrase as ${phraseKey} in language ${alternativeLanguage}.`,
            );
            if (errorOnNoGlobalKeyTranslation && entry?.globalKey) {
              throw new Error(
                `Missing translation for global key ${key} in language ${alternativeLanguage}`,
              );
            }
            continue;
          }

          const existingMessage = entry?.messages[alternativeLanguage];
          altTranslations[key] = {
            message: phraseTranslationMessage,
            validated:
              phraseAltTranslations[phraseKey]?.validated ??
              existingMessage?.validated,
          };
        }

        const altTranslationFilePath = getAltLanguageFilePath(
          loadedTranslation.filePath,
          alternativeLanguage,
        );

        await mkdir(path.dirname(altTranslationFilePath), {
          recursive: true,
        });
        await writeFile(
          altTranslationFilePath,
          `${JSON.stringify(altTranslations, null, 2)}\n`,
        );
      }
    }
  }
}

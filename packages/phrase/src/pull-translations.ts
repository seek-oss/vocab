import { writeFile, mkdir } from './file';
import path from 'path';

import {
  loadAllTranslations,
  getAltLanguageFilePath,
  getAltLanguages,
  getUniqueKey,
} from '@vocab/core';
import type { TranslationFileContents, UserConfig } from '@vocab/types';

import { pullAllTranslations, ensureBranch } from './phrase-api';
import { trace } from './logger';

interface PullOptions {
  branch?: string;
  deleteUnusedKeys?: boolean;
}

export async function pull(
  { branch = 'local-development' }: PullOptions,
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
    const devTranslations = loadedTranslation.languages[config.devLanguage];

    if (!devTranslations) {
      throw new Error('No dev language translations loaded');
    }

    const defaultValues: TranslationFileContents = { ...devTranslations };
    const localKeys = Object.keys(defaultValues);

    for (const key of localKeys) {
      defaultValues[key] = {
        ...defaultValues[key],
        ...allPhraseTranslations[config.devLanguage][
          getUniqueKey(key, loadedTranslation.namespace)
        ],
      };
    }

    // Only write a `_meta` field if necessary
    if (Object.keys(loadedTranslation.metadata).length > 0) {
      defaultValues._meta = loadedTranslation.metadata;
    }

    await writeFile(
      loadedTranslation.filePath,
      `${JSON.stringify(defaultValues, null, 2)}\n`,
    );

    for (const alternativeLanguage of alternativeLanguages) {
      if (alternativeLanguage in allPhraseTranslations) {
        const altTranslations = {
          ...loadedTranslation.languages[alternativeLanguage],
        };
        const phraseAltTranslations =
          allPhraseTranslations[alternativeLanguage];

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

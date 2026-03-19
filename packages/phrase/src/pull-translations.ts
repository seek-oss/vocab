import { writeFile, mkdir } from './file';
import path from 'path';

import {
  type TranslationFileContents,
  type UserConfig,
  type TranslationsByLanguage,
  loadAllTranslations,
  getAltLanguageFilePath,
  getAltLanguages,
  getUniqueKey,
} from '@vocab/core';

import { ensureBranch, pullAllTranslations } from './phrase-api';
import { trace, log } from './logger';
import {
  compareTranslations,
  getDiffSummary,
  filterPullDiff,
} from './diff-utils';
import {
  formatDiffSummary,
  formatDiffReport,
  formatConfirmationPrompt,
} from './diff-formatter';
import { promptConfirmation } from './prompt-utils';

interface PullOptions {
  branch?: string;
  deleteUnusedKeys?: boolean;
  errorOnNoGlobalKeyTranslation?: boolean;
  dryRun?: boolean;
  force?: boolean;
  interactive?: boolean;
}

export async function pull(
  {
    branch = 'local-development',
    errorOnNoGlobalKeyTranslation,
    dryRun = false,
    force = false,
    interactive = true,
  }: PullOptions,
  config: UserConfig,
) {
  trace(`Preparing to pull translations from branch ${branch}`);
  await ensureBranch(branch);
  const alternativeLanguages = getAltLanguages(config);

  // Fetch remote translations
  log('Fetching remote translations...');
  const allPhraseTranslations = await pullAllTranslations(branch);
  trace(
    `Fetching translations from Phrase for languages ${
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

  // Load current local translations
  const allVocabTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
    config,
  );

  // Build current local translations structure for comparison
  const localTranslations: TranslationsByLanguage = {};
  const allLanguages = [config.devLanguage, ...alternativeLanguages];

  for (const language of allLanguages) {
    localTranslations[language] = {};
  }

  for (const loadedTranslation of allVocabTranslations) {
    const sync = loadedTranslation.getSyncView();

    for (const language of allLanguages) {
      for (const localKey of loadedTranslation.keys) {
        const entry = sync.entries[localKey];
        const messageData = entry?.messages[language];
        if (!messageData) {
          continue;
        }

        const phraseKey =
          entry.globalKey ?? getUniqueKey(localKey, loadedTranslation.namespace);

        localTranslations[language][phraseKey] = {
          message: messageData.message,
          ...(messageData.validated !== undefined && {
            validated: messageData.validated,
          }),
          ...(language === config.devLanguage && {
            description: entry.description,
            globalKey: entry.globalKey,
            tags: entry.tags,
          }),
        };
      }
    }
  }

  // Compare remote vs local translations (for pull, remote is "local" and local is "remote")
  const diff = compareTranslations(allPhraseTranslations, localTranslations);
  const pullDiff = filterPullDiff(diff);
  const summary = getDiffSummary(pullDiff);

  // Display diff summary
  log(formatDiffSummary(summary, 'pull'));

  if (!summary.hasChanges) {
    log('No changes to pull. Local translations are up to date.');
    return;
  }

  // Display detailed diff report
  if (interactive || dryRun) {
    log('\nDetailed changes:');
    log(formatDiffReport(pullDiff, 'pull'));
  }

  // Handle dry run mode
  if (dryRun) {
    log('\nDry run mode: No changes were made.');
    return;
  }

  // Handle force mode or get user confirmation
  let shouldProceed = force;

  if (!force && interactive) {
    const confirmationPrompt = formatConfirmationPrompt(summary, 'pull');
    shouldProceed = await promptConfirmation(confirmationPrompt, false);
  }

  if (!shouldProceed) {
    log('Pull cancelled by user.');
    return;
  }

  // Proceed with the actual pull - write the updated files
  log('Applying changes...');

  for (const loadedTranslation of allVocabTranslations) {
    const sync = loadedTranslation.getSyncView();

    // Build dev file contents from sync view (metadata once per key)
    const defaultValues: TranslationFileContents = {};
    for (const key of loadedTranslation.keys) {
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
        ...(entry.description !== undefined && { description: entry.description }),
        ...(entry.globalKey !== undefined && { globalKey: entry.globalKey }),
        ...(entry.tags !== undefined && { tags: entry.tags }),
      };
    }

    const localKeys = loadedTranslation.keys;

    for (const key of localKeys) {
      const entry = sync.entries[key];
      const phraseKey =
        entry?.globalKey ?? getUniqueKey(key, loadedTranslation.namespace);

      const phraseTranslation =
        allPhraseTranslations[config.devLanguage][phraseKey];
      if (phraseTranslation && defaultValues[key]) {
        defaultValues[key] = {
          ...defaultValues[key],
          ...phraseTranslation,
        };
      }
    }

    if (Object.keys(sync.metadata).length > 0) {
      defaultValues._meta = sync.metadata;
    }

    await writeFile(
      loadedTranslation.filePath,
      `${JSON.stringify(defaultValues, null, 2)}\n`,
    );

    for (const alternativeLanguage of alternativeLanguages) {
      if (alternativeLanguage in allPhraseTranslations) {
        const altTranslations: Record<string, string | { message: string; validated?: boolean }> =
          {};
        const phraseAltTranslations =
          allPhraseTranslations[alternativeLanguage];

        for (const key of localKeys) {
          const entry = sync.entries[key];
          const phraseKey =
            entry?.globalKey ?? getUniqueKey(key, loadedTranslation.namespace);
          const phraseTranslationData = phraseAltTranslations[phraseKey];

          if (!phraseTranslationData?.message) {
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
          const merged = {
            message: phraseTranslationData.message,
            validated:
              phraseTranslationData.validated ?? existingMessage?.validated,
          };
          altTranslations[key] =
            merged.validated === undefined
              ? merged.message
              : { message: merged.message, validated: merged.validated };
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

  log('Pull completed successfully!');
}

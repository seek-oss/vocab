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
    for (const language of allLanguages) {
      const languageTranslations = loadedTranslation.languages[language];
      if (!languageTranslations) {
        continue;
      }

      for (const localKey of Object.keys(languageTranslations)) {
        const globalKey =
          loadedTranslation.languages[config.devLanguage]?.[localKey]
            ?.globalKey;
        const phraseKey =
          globalKey ?? getUniqueKey(localKey, loadedTranslation.namespace);

        localTranslations[language][phraseKey] = languageTranslations[localKey];
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
    const devTranslations = loadedTranslation.languages[config.devLanguage];

    if (!devTranslations) {
      throw new Error('No dev language translations loaded');
    }

    const defaultValues: TranslationFileContents = { ...devTranslations };
    const localKeys = Object.keys(defaultValues);

    for (const key of localKeys) {
      const phraseKey =
        defaultValues[key].globalKey ??
        getUniqueKey(key, loadedTranslation.namespace);

      const phraseTranslation =
        allPhraseTranslations[config.devLanguage][phraseKey];
      if (phraseTranslation) {
        defaultValues[key] = {
          ...defaultValues[key],
          ...phraseTranslation,
        };
      }
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
          const phraseKey =
            defaultValues[key].globalKey ??
            getUniqueKey(key, loadedTranslation.namespace);
          const phraseTranslationData = phraseAltTranslations[phraseKey];

          if (!phraseTranslationData?.message) {
            trace(
              `Missing translation. No translation for key ${key} in phrase as ${phraseKey} in language ${alternativeLanguage}.`,
            );
            if (errorOnNoGlobalKeyTranslation && defaultValues[key].globalKey) {
              throw new Error(
                `Missing translation for global key ${key} in language ${alternativeLanguage}`,
              );
            }
            continue;
          }

          const merged = {
            ...altTranslations[key],
            ...phraseTranslationData,
          };
          // Prefer string form when only message (no validated) for cleaner files
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

import {
  loadAllTranslations,
  getUniqueKey,
  type TranslationData,
  type TranslationsByLanguage,
  type UserConfig,
} from '@vocab/core';
import {
  ensureBranch,
  pushTranslationsWithDiff,
  pullAllTranslations,
} from './phrase-api';
import { trace, log } from './logger';
import {
  compareTranslations,
  getDiffSummary,
  filterPushDiff,
} from './diff-utils';
import {
  formatDiffSummary,
  formatDiffReport,
  formatConfirmationPrompt,
} from './diff-formatter';
import { promptConfirmation } from './prompt-utils';

interface PushOptions {
  autoTranslate?: boolean;
  branch: string;
  deleteUnusedKeys?: boolean;
  ignore?: string[];
  dryRun?: boolean;
  force?: boolean;
  interactive?: boolean;
}

/**
 * Uploads translations to the Phrase API for each language.
 * A unique namespace is appended to each key using the file path the key came from.
 * Now includes diff comparison and user confirmation.
 */
export async function push(
  {
    autoTranslate: _autoTranslate,
    branch,
    deleteUnusedKeys,
    ignore,
    dryRun = false,
    force = false,
    interactive = true,
  }: PushOptions,
  config: UserConfig,
) {
  if (ignore && ignore.length > 0) {
    trace(`ignoring files on paths: ${ignore.join(', ')}`);
  }

  // Load all local translations
  const allLanguageTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
    {
      ...config,
      ignore: [...(config.ignore || []), ...(ignore || [])],
    },
  );

  trace(`Preparing to push translations to branch ${branch}`);
  const allLanguages = config.languages.map((v) => v.name);
  await ensureBranch(branch);

  // Build local translations structure from sync view (metadata once per key)
  const localTranslations: TranslationsByLanguage = {};

  for (const loadedTranslation of allLanguageTranslations) {
    const sync = loadedTranslation.getSyncView();
    const { metadata: { tags: sharedTags = [] } = {} } = sync;

    for (const language of allLanguages) {
      if (!localTranslations[language]) {
        localTranslations[language] = {};
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

        localTranslations[language][phraseKey] = localTranslation;
      }
    }
  }

  // Fetch current remote translations for comparison
  log('Fetching current remote translations for comparison...');
  const remoteTranslations = await pullAllTranslations(branch);

  // Compare local vs remote translations
  const diff = compareTranslations(localTranslations, remoteTranslations);
  const pushDiff = filterPushDiff(diff, deleteUnusedKeys);
  const summary = getDiffSummary(pushDiff);

  // Display diff summary
  log(formatDiffSummary(summary, 'push'));

  if (!summary.hasChanges) {
    log('No changes to push. Remote translations are up to date.');
    return;
  }

  // Display detailed diff report
  if (interactive || dryRun) {
    log('\nDetailed changes:');
    log(formatDiffReport(pushDiff, 'push'));
  }

  // Handle dry run mode
  if (dryRun) {
    log('\nDry run mode: No changes were made.');
    return;
  }

  // Handle force mode or get user confirmation
  let shouldProceed = force;

  if (!force && interactive) {
    const confirmationPrompt = formatConfirmationPrompt(summary, 'push');
    shouldProceed = await promptConfirmation(confirmationPrompt, false);
  }

  if (!shouldProceed) {
    log('Push cancelled by user.');
    return;
  }

  // Proceed with the push using diff-based approach
  trace(
    `Pushing translations to phrase for languages ${allLanguages.join(', ')}`,
  );

  await pushTranslationsWithDiff(
    localTranslations,
    {
      devLanguage: config.devLanguage,
      branch,
    },
    pushDiff,
  );

  // Note: deleteUnusedKeys is now handled within the diff-based push
  // since we can precisely delete only the keys that were marked as deleted in the diff
  // Note: _autoTranslate is not yet supported in diff-based push (reserved for future use)

  log('Push completed successfully!');
}

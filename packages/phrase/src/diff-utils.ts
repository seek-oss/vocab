import type { TranslationsByLanguage, TranslationData } from '@vocab/core';

export interface TranslationDiff {
  added: Record<string, TranslationData>;
  modified: Record<string, { local: TranslationData; remote: TranslationData }>;
  deleted: Record<string, TranslationData>;
  same: Record<string, TranslationData>;
}

export type DiffByLanguage = Record<string, TranslationDiff>;

export interface DiffSummary {
  totalAdded: number;
  totalModified: number;
  totalDeleted: number;
  languageCount: number;
  hasChanges: boolean;
}

/**
 * Compare local translations with remote translations to generate a diff
 * @param local Local translations by language
 * @param remote Remote translations by language
 * @returns Diff organized by language
 */
export function compareTranslations(
  local: TranslationsByLanguage,
  remote: TranslationsByLanguage,
): DiffByLanguage {
  const diff: DiffByLanguage = {};
  const allLanguages = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const language of allLanguages) {
    const localTranslations = local[language] || {};
    const remoteTranslations = remote[language] || {};

    const languageDiff: TranslationDiff = {
      added: {},
      modified: {},
      deleted: {},
      same: {},
    };

    // Find added and modified translations (present in local)
    for (const [key, localTranslation] of Object.entries(localTranslations)) {
      const remoteTranslation = remoteTranslations[key];

      if (!remoteTranslation) {
        languageDiff.added[key] = localTranslation;
      } else if (!areTranslationsEqual(localTranslation, remoteTranslation)) {
        languageDiff.modified[key] = {
          local: localTranslation,
          remote: remoteTranslation,
        };
      } else {
        languageDiff.same[key] = localTranslation;
      }
    }

    // Find deleted translations (present in remote but not in local)
    for (const [key, remoteTranslation] of Object.entries(remoteTranslations)) {
      if (!localTranslations[key]) {
        languageDiff.deleted[key] = remoteTranslation;
      }
    }

    diff[language] = languageDiff;
  }

  return diff;
}

/**
 * Compare two translation data objects for equality
 * @param local Local translation data
 * @param remote Remote translation data
 * @returns True if translations are equal
 */
function areTranslationsEqual(
  local: TranslationData,
  remote: TranslationData,
): boolean {
  // Compare the message content (most important)
  if (local.message !== remote.message) {
    return false;
  }

  // Compare description
  if (local.description !== remote.description) {
    return false;
  }

  // Compare tags (handle undefined/empty arrays as equivalent)
  const localTags = local.tags || [];
  const remoteTags = remote.tags || [];

  if (localTags.length !== remoteTags.length) {
    return false;
  }

  // Sort and compare tags
  const sortedLocalTags = [...localTags].sort();
  const sortedRemoteTags = [...remoteTags].sort();

  for (let i = 0; i < sortedLocalTags.length; i++) {
    if (sortedLocalTags[i] !== sortedRemoteTags[i]) {
      return false;
    }
  }

  // Compare validation status
  if (local.validated !== remote.validated) {
    return false;
  }

  return true;
}

/**
 * Generate a summary of the diff
 * @param diff Diff by language
 * @returns Summary statistics
 */
export function getDiffSummary(diff: DiffByLanguage): DiffSummary {
  let totalAdded = 0;
  let totalModified = 0;
  let totalDeleted = 0;

  const languageCount = Object.keys(diff).length;

  for (const languageDiff of Object.values(diff)) {
    totalAdded += Object.keys(languageDiff.added).length;
    totalModified += Object.keys(languageDiff.modified).length;
    totalDeleted += Object.keys(languageDiff.deleted).length;
  }

  const hasChanges = totalAdded > 0 || totalModified > 0 || totalDeleted > 0;

  return {
    totalAdded,
    totalModified,
    totalDeleted,
    languageCount,
    hasChanges,
  };
}

/**
 * Filter diff to only include changes that would be applied during push
 * (typically excludes deleted translations since push doesn't delete remote keys)
 * @param diff Full diff
 * @param includeDeleted Whether to include deleted translations
 * @returns Filtered diff
 */
export function filterPushDiff(
  diff: DiffByLanguage,
  includeDeleted: boolean = false,
): DiffByLanguage {
  const filtered: DiffByLanguage = {};

  for (const [language, languageDiff] of Object.entries(diff)) {
    filtered[language] = {
      ...languageDiff,
      deleted: includeDeleted ? languageDiff.deleted : {},
    };
  }

  return filtered;
}

/**
 * Filter diff to only include changes that would be applied during pull
 * (includes all changes from remote)
 * @param diff Full diff (where local is treated as "remote" and remote as "local")
 * @returns Filtered diff for pull operation
 */
export function filterPullDiff(diff: DiffByLanguage): DiffByLanguage {
  // For pull, we want to show what local changes would be made
  // The diff should be inverted: remote -> local
  return diff;
}

import type { DiffByLanguage, DiffSummary } from './diff-utils';
import type { TranslationData } from '@vocab/core';

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

/**
 * Format a diff summary for display
 * @param summary Diff summary
 * @param operation Operation type ('push' or 'pull')
 * @returns Formatted summary string
 */
export function formatDiffSummary(
  summary: DiffSummary,
  operation: 'push' | 'pull',
): string {
  if (!summary.hasChanges) {
    return `${colors.gray}No changes to ${operation}.${colors.reset}`;
  }

  const parts: string[] = [];

  if (summary.totalAdded > 0) {
    parts.push(`${colors.green}${summary.totalAdded} added${colors.reset}`);
  }

  if (summary.totalModified > 0) {
    parts.push(
      `${colors.yellow}${summary.totalModified} modified${colors.reset}`,
    );
  }

  if (summary.totalDeleted > 0) {
    parts.push(`${colors.red}${summary.totalDeleted} deleted${colors.reset}`);
  }

  const languageText =
    summary.languageCount === 1
      ? '1 language'
      : `${summary.languageCount} languages`;

  return `${colors.bold}Translation changes to ${operation}:${colors.reset} ${parts.join(', ')} across ${languageText}`;
}

/**
 * Format a complete diff report for display
 * @param diff Diff by language
 * @param operation Operation type ('push' or 'pull')
 * @param maxDisplayKeys Maximum number of keys to display per section (default: 10)
 * @returns Formatted diff report
 */
export function formatDiffReport(
  diff: DiffByLanguage,
  operation: 'push' | 'pull',
  maxDisplayKeys: number = 10,
): string {
  const output: string[] = [];

  // Sort languages alphabetically
  const sortedLanguages = Object.keys(diff).sort();

  for (const language of sortedLanguages) {
    const languageDiff = diff[language];
    const hasChanges =
      Object.keys(languageDiff.added).length > 0 ||
      Object.keys(languageDiff.modified).length > 0 ||
      Object.keys(languageDiff.deleted).length > 0;

    if (!hasChanges) {
      continue;
    }

    output.push(`${colors.bold}${colors.cyan}${language}${colors.reset}`);
    output.push('');

    if (Object.keys(languageDiff.added).length > 0) {
      output.push(
        `  ${colors.green}+ Added (${Object.keys(languageDiff.added).length}):${colors.reset}`,
      );
      output.push(
        ...formatTranslationSection(
          languageDiff.added,
          'added',
          maxDisplayKeys,
        ),
      );
      output.push('');
    }

    if (Object.keys(languageDiff.modified).length > 0) {
      output.push(
        `  ${colors.yellow}~ Modified (${Object.keys(languageDiff.modified).length}):${colors.reset}`,
      );
      output.push(
        ...formatModifiedSection(languageDiff.modified, maxDisplayKeys),
      );
      output.push('');
    }

    if (Object.keys(languageDiff.deleted).length > 0) {
      output.push(
        `  ${colors.red}- Deleted (${Object.keys(languageDiff.deleted).length}):${colors.reset}`,
      );
      output.push(
        ...formatTranslationSection(
          languageDiff.deleted,
          'deleted',
          maxDisplayKeys,
        ),
      );
      output.push('');
    }
  }

  return output.join('\n');
}

/**
 * Format a section of translations (added or deleted)
 * @param translations Translations to format
 * @param type Section type
 * @param maxDisplayKeys Maximum keys to display
 * @returns Formatted lines
 */
function formatTranslationSection(
  translations: Record<string, TranslationData>,
  type: 'added' | 'deleted',
  maxDisplayKeys: number,
): string[] {
  const output: string[] = [];
  const keys = Object.keys(translations).sort();
  const displayKeys = keys.slice(0, maxDisplayKeys);
  const remainingCount = keys.length - maxDisplayKeys;

  const color = type === 'added' ? colors.green : colors.red;
  const symbol = type === 'added' ? '+' : '-';

  for (const key of displayKeys) {
    const translation = translations[key];
    const message = truncateMessage(translation.message, 60);
    output.push(
      `    ${color}${symbol} ${key}${colors.reset}: ${colors.dim}"${message}"${colors.reset}`,
    );

    if (translation.description) {
      output.push(
        `      ${colors.gray}// ${translation.description}${colors.reset}`,
      );
    }
  }

  if (remainingCount > 0) {
    output.push(
      `    ${colors.gray}... and ${remainingCount} more${colors.reset}`,
    );
  }

  return output;
}

/**
 * Format modified translations section
 * @param modifications Modified translations
 * @param maxDisplayKeys Maximum keys to display
 * @returns Formatted lines
 */
function formatModifiedSection(
  modifications: Record<
    string,
    { local: TranslationData; remote: TranslationData }
  >,
  maxDisplayKeys: number,
): string[] {
  const output: string[] = [];
  const keys = Object.keys(modifications).sort();
  const displayKeys = keys.slice(0, maxDisplayKeys);
  const remainingCount = keys.length - maxDisplayKeys;

  for (const key of displayKeys) {
    const { local, remote } = modifications[key];
    output.push(`    ${colors.yellow}~ ${key}${colors.reset}:`);

    // Show message changes
    if (local.message !== remote.message) {
      const localMessage = truncateMessage(local.message, 50);
      const remoteMessage = truncateMessage(remote.message, 50);
      output.push(`      ${colors.red}- "${remoteMessage}"${colors.reset}`);
      output.push(`      ${colors.green}+ "${localMessage}"${colors.reset}`);
    }

    // Show description changes
    if (local.description !== remote.description) {
      if (remote.description) {
        output.push(
          `      ${colors.red}- // ${remote.description}${colors.reset}`,
        );
      }
      if (local.description) {
        output.push(
          `      ${colors.green}+ // ${local.description}${colors.reset}`,
        );
      }
    }

    // Show validation status changes
    if (local.validated !== remote.validated) {
      output.push(
        `      ${colors.gray}validation: ${remote.validated ? 'true' : 'false'} → ${local.validated ? 'true' : 'false'}${colors.reset}`,
      );
    }

    // Show tag changes
    const localTags = local.tags || [];
    const remoteTags = remote.tags || [];
    if (
      JSON.stringify(localTags.sort()) !== JSON.stringify(remoteTags.sort())
    ) {
      if (remoteTags.length > 0) {
        output.push(
          `      ${colors.red}- tags: [${remoteTags.join(', ')}]${colors.reset}`,
        );
      }
      if (localTags.length > 0) {
        output.push(
          `      ${colors.green}+ tags: [${localTags.join(', ')}]${colors.reset}`,
        );
      }
    }

    output.push('');
  }

  if (remainingCount > 0) {
    output.push(
      `    ${colors.gray}... and ${remainingCount} more${colors.reset}`,
    );
  }

  return output;
}

/**
 * Truncate a message to a maximum length
 * @param message Message to truncate
 * @param maxLength Maximum length
 * @returns Truncated message
 */
function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) {
    return message;
  }
  return `${message.slice(0, maxLength - 3)}...`;
}

/**
 * Format a confirmation prompt
 * @param summary Diff summary
 * @param operation Operation type
 * @returns Formatted prompt
 */
export function formatConfirmationPrompt(
  summary: DiffSummary,
  operation: 'push' | 'pull',
): string {
  if (!summary.hasChanges) {
    return `${colors.gray}No changes to ${operation}.${colors.reset}`;
  }

  const actionVerb = operation === 'push' ? 'upload' : 'download';
  const direction = operation === 'push' ? 'to remote' : 'from remote';

  return `${colors.bold}Do you want to ${actionVerb} these changes ${direction}?${colors.reset} (y/N)`;
}

/**
 * Remove color codes from a string (for logging to files or when colors are disabled)
 * @param text Text with color codes
 * @returns Plain text
 */
export function stripColors(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

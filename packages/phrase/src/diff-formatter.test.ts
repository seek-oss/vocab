import { describe, it, expect } from 'vitest';
import {
  formatDiffSummary,
  formatDiffReport,
  formatConfirmationPrompt,
  stripColors,
} from './diff-formatter';
import type { DiffByLanguage, DiffSummary } from './diff-utils';
import type { TranslationData } from '@vocab/core';

describe('diff-formatter', () => {
  const createTranslation = (
    message: string,
    overrides: Partial<TranslationData> = {},
  ): TranslationData => ({
    message,
    description: undefined,
    tags: [],
    validated: false,
    ...overrides,
  });

  describe('formatDiffSummary', () => {
    it('should format summary with no changes', () => {
      const summary: DiffSummary = {
        totalAdded: 0,
        totalModified: 0,
        totalDeleted: 0,
        languageCount: 1,
        hasChanges: false,
      };

      const result = formatDiffSummary(summary, 'push');
      const plain = stripColors(result);

      expect(plain).toBe('No changes to push.');
    });

    it('should format summary with only additions', () => {
      const summary: DiffSummary = {
        totalAdded: 3,
        totalModified: 0,
        totalDeleted: 0,
        languageCount: 2,
        hasChanges: true,
      };

      const result = formatDiffSummary(summary, 'push');
      const plain = stripColors(result);

      expect(plain).toBe(
        'Translation changes to push: 3 added across 2 languages',
      );
    });

    it('should format summary with mixed changes', () => {
      const summary: DiffSummary = {
        totalAdded: 2,
        totalModified: 1,
        totalDeleted: 3,
        languageCount: 1,
        hasChanges: true,
      };

      const result = formatDiffSummary(summary, 'pull');
      const plain = stripColors(result);

      expect(plain).toBe(
        'Translation changes to pull: 2 added, 1 modified, 3 deleted across 1 language',
      );
    });

    it('should handle singular vs plural language count', () => {
      const summary: DiffSummary = {
        totalAdded: 1,
        totalModified: 0,
        totalDeleted: 0,
        languageCount: 1,
        hasChanges: true,
      };

      const result = formatDiffSummary(summary, 'push');
      const plain = stripColors(result);

      expect(plain).toBe(
        'Translation changes to push: 1 added across 1 language',
      );
    });
  });

  describe('formatDiffReport', () => {
    it('should format a complete diff report', () => {
      const diff: DiffByLanguage = {
        en: {
          added: {
            'new.key': createTranslation('New message', {
              description: 'A new key',
            }),
          },
          modified: {
            'changed.key': {
              local: createTranslation('Updated message'),
              remote: createTranslation('Old message'),
            },
          },
          deleted: {
            'removed.key': createTranslation('Removed message'),
          },
          same: {},
        },
        fr: {
          added: {
            'french.key': createTranslation('Message français'),
          },
          modified: {},
          deleted: {},
          same: {},
        },
      };

      const result = formatDiffReport(diff, 'push', 5);
      const plain = stripColors(result);

      expect(plain).toContain('en');
      expect(plain).toContain('+ Added (1):');
      expect(plain).toContain('+ new.key: "New message"');
      expect(plain).toContain('// A new key');
      expect(plain).toContain('~ Modified (1):');
      expect(plain).toContain('~ changed.key:');
      expect(plain).toContain('- "Old message"');
      expect(plain).toContain('+ "Updated message"');
      expect(plain).toContain('- Deleted (1):');
      expect(plain).toContain('- removed.key: "Removed message"');

      expect(plain).toContain('fr');
      expect(plain).toContain('+ Added (1):');
      expect(plain).toContain('+ french.key: "Message français"');
    });

    it('should handle empty diff sections', () => {
      const diff: DiffByLanguage = {
        en: {
          added: {
            'only.added': createTranslation('Only added'),
          },
          modified: {},
          deleted: {},
          same: {},
        },
      };

      const result = formatDiffReport(diff, 'push');
      const plain = stripColors(result);

      expect(plain).toContain('+ Added (1):');
      expect(plain).not.toContain('Modified');
      expect(plain).not.toContain('Deleted');
    });

    it('should truncate long lists', () => {
      const diff: DiffByLanguage = {
        en: {
          added: {
            key1: createTranslation('Message 1'),
            key2: createTranslation('Message 2'),
            key3: createTranslation('Message 3'),
            key4: createTranslation('Message 4'),
            key5: createTranslation('Message 5'),
            key6: createTranslation('Message 6'),
          },
          modified: {},
          deleted: {},
          same: {},
        },
      };

      const result = formatDiffReport(diff, 'push', 3);
      const plain = stripColors(result);

      expect(plain).toContain('key1');
      expect(plain).toContain('key2');
      expect(plain).toContain('key3');
      expect(plain).toContain('... and 3 more');
      expect(plain).not.toContain('key4');
    });

    it('should show tag changes in modified section', () => {
      const diff: DiffByLanguage = {
        en: {
          added: {},
          modified: {
            'tagged.key': {
              local: createTranslation('Same message', {
                tags: ['new', 'tag'],
              }),
              remote: createTranslation('Same message', {
                tags: ['old', 'tag'],
              }),
            },
          },
          deleted: {},
          same: {},
        },
      };

      const result = formatDiffReport(diff, 'push');
      const plain = stripColors(result);

      expect(plain).toContain('~ tagged.key:');
      expect(plain).toContain('- tags: [old, tag]');
      expect(plain).toContain('+ tags: [new, tag]');
    });

    it('should show validation status changes', () => {
      const diff: DiffByLanguage = {
        en: {
          added: {},
          modified: {
            'validated.key': {
              local: createTranslation('Same message', { validated: true }),
              remote: createTranslation('Same message', { validated: false }),
            },
          },
          deleted: {},
          same: {},
        },
      };

      const result = formatDiffReport(diff, 'push');
      const plain = stripColors(result);

      expect(plain).toContain('validation: false → true');
    });

    it('should skip languages with no changes', () => {
      const diff: DiffByLanguage = {
        en: {
          added: {
            key1: createTranslation('Message'),
          },
          modified: {},
          deleted: {},
          same: {},
        },
        fr: {
          added: {},
          modified: {},
          deleted: {},
          same: {},
        },
      };

      const result = formatDiffReport(diff, 'push');
      const plain = stripColors(result);

      expect(plain).toContain('en');
      expect(plain).not.toContain('fr');
    });
  });

  describe('formatConfirmationPrompt', () => {
    it('should format confirmation prompt for push', () => {
      const summary: DiffSummary = {
        totalAdded: 1,
        totalModified: 1,
        totalDeleted: 0,
        languageCount: 1,
        hasChanges: true,
      };

      const result = formatConfirmationPrompt(summary, 'push');
      const plain = stripColors(result);

      expect(plain).toBe(
        'Do you want to upload these changes to remote? (y/N)',
      );
    });

    it('should format confirmation prompt for pull', () => {
      const summary: DiffSummary = {
        totalAdded: 1,
        totalModified: 1,
        totalDeleted: 0,
        languageCount: 1,
        hasChanges: true,
      };

      const result = formatConfirmationPrompt(summary, 'pull');
      const plain = stripColors(result);

      expect(plain).toBe(
        'Do you want to download these changes from remote? (y/N)',
      );
    });

    it('should handle no changes', () => {
      const summary: DiffSummary = {
        totalAdded: 0,
        totalModified: 0,
        totalDeleted: 0,
        languageCount: 1,
        hasChanges: false,
      };

      const result = formatConfirmationPrompt(summary, 'push');
      const plain = stripColors(result);

      expect(plain).toBe('No changes to push.');
    });
  });

  describe('stripColors', () => {
    it('should remove ANSI color codes', () => {
      const coloredText =
        '\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[1mBold\x1b[0m';
      const result = stripColors(coloredText);

      expect(result).toBe('Red Green Bold');
    });

    it('should handle text without colors', () => {
      const plainText = 'Plain text';
      const result = stripColors(plainText);

      expect(result).toBe('Plain text');
    });

    it('should handle empty string', () => {
      const result = stripColors('');

      expect(result).toBe('');
    });
  });
});

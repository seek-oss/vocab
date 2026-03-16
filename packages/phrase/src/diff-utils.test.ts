import { describe, it, expect } from 'vitest';
import {
  compareTranslations,
  getDiffSummary,
  filterPushDiff,
  filterPullDiff,
} from './diff-utils';
import type { TranslationsByLanguage, TranslationData } from '@vocab/core';

describe('diff-utils', () => {
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

  describe('compareTranslations', () => {
    it('should identify added translations', () => {
      const local: TranslationsByLanguage = {
        en: {
          'new.key': createTranslation('New message'),
          'existing.key': createTranslation('Existing message'),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          'existing.key': createTranslation('Existing message'),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.added).toEqual({
        'new.key': createTranslation('New message'),
      });
      expect(diff.en.modified).toEqual({});
      expect(diff.en.deleted).toEqual({});
    });

    it('should identify modified translations', () => {
      const local: TranslationsByLanguage = {
        en: {
          'modified.key': createTranslation('Updated message'),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          'modified.key': createTranslation('Original message'),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.added).toEqual({});
      expect(diff.en.modified).toEqual({
        'modified.key': {
          local: createTranslation('Updated message'),
          remote: createTranslation('Original message'),
        },
      });
      expect(diff.en.deleted).toEqual({});
    });

    it('should identify deleted translations', () => {
      const local: TranslationsByLanguage = {
        en: {
          'existing.key': createTranslation('Existing message'),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          'existing.key': createTranslation('Existing message'),
          'deleted.key': createTranslation('Deleted message'),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.added).toEqual({});
      expect(diff.en.modified).toEqual({});
      expect(diff.en.deleted).toEqual({
        'deleted.key': createTranslation('Deleted message'),
      });
    });

    it('should handle multiple languages', () => {
      const local: TranslationsByLanguage = {
        en: {
          key1: createTranslation('English message'),
        },
        fr: {
          key1: createTranslation('French message'),
          key2: createTranslation('New French message'),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          key1: createTranslation('English message'),
          key2: createTranslation('Old English message'),
        },
        fr: {
          key1: createTranslation('Old French message'),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.added).toEqual({});
      expect(diff.en.deleted).toEqual({
        key2: createTranslation('Old English message'),
      });

      expect(diff.fr.added).toEqual({
        key2: createTranslation('New French message'),
      });
      expect(diff.fr.modified).toEqual({
        key1: {
          local: createTranslation('French message'),
          remote: createTranslation('Old French message'),
        },
      });
    });

    it('should detect changes in description', () => {
      const local: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', {
            description: 'New description',
          }),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', {
            description: 'Old description',
          }),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.modified).toEqual({
        key1: {
          local: createTranslation('Same message', {
            description: 'New description',
          }),
          remote: createTranslation('Same message', {
            description: 'Old description',
          }),
        },
      });
    });

    it('should detect changes in tags', () => {
      const local: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { tags: ['new', 'tag'] }),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { tags: ['old', 'tag'] }),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.modified).toEqual({
        key1: {
          local: createTranslation('Same message', { tags: ['new', 'tag'] }),
          remote: createTranslation('Same message', { tags: ['old', 'tag'] }),
        },
      });
    });

    it('should detect changes in validation status', () => {
      const local: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { validated: true }),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { validated: false }),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.modified).toEqual({
        key1: {
          local: createTranslation('Same message', { validated: true }),
          remote: createTranslation('Same message', { validated: false }),
        },
      });
    });

    it('should treat undefined and empty tags as equivalent', () => {
      const local: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { tags: undefined }),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { tags: [] }),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.added).toEqual({});
      expect(diff.en.modified).toEqual({});
      expect(diff.en.deleted).toEqual({});
    });

    it('should ignore tag order when comparing', () => {
      const local: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { tags: ['a', 'b', 'c'] }),
        },
      };

      const remote: TranslationsByLanguage = {
        en: {
          key1: createTranslation('Same message', { tags: ['c', 'a', 'b'] }),
        },
      };

      const diff = compareTranslations(local, remote);

      expect(diff.en.added).toEqual({});
      expect(diff.en.modified).toEqual({});
      expect(diff.en.deleted).toEqual({});
    });
  });

  describe('getDiffSummary', () => {
    it('should calculate summary statistics', () => {
      const diff = {
        en: {
          added: {
            key1: createTranslation('msg1'),
            key2: createTranslation('msg2'),
          },
          modified: {
            key3: {
              local: createTranslation('new'),
              remote: createTranslation('old'),
            },
          },
          deleted: {},
          same: {},
        },
        fr: {
          added: { key4: createTranslation('msg4') },
          modified: {},
          deleted: {
            key5: createTranslation('msg5'),
            key6: createTranslation('msg6'),
          },
          same: {},
        },
      };

      const summary = getDiffSummary(diff);

      expect(summary).toEqual({
        totalAdded: 3,
        totalModified: 1,
        totalDeleted: 2,
        languageCount: 2,
        hasChanges: true,
      });
    });

    it('should indicate no changes when diff is empty', () => {
      const diff = {
        en: {
          added: {},
          modified: {},
          deleted: {},
          same: {},
        },
      };

      const summary = getDiffSummary(diff);

      expect(summary).toEqual({
        totalAdded: 0,
        totalModified: 0,
        totalDeleted: 0,
        languageCount: 1,
        hasChanges: false,
      });
    });
  });

  describe('filterPushDiff', () => {
    const fullDiff = {
      en: {
        added: { key1: createTranslation('added') },
        modified: {
          key2: {
            local: createTranslation('new'),
            remote: createTranslation('old'),
          },
        },
        deleted: { key3: createTranslation('deleted') },
        same: {},
      },
    };

    it('should exclude deleted translations by default', () => {
      const filtered = filterPushDiff(fullDiff);

      expect(filtered.en.added).toEqual(fullDiff.en.added);
      expect(filtered.en.modified).toEqual(fullDiff.en.modified);
      expect(filtered.en.deleted).toEqual({});
    });

    it('should include deleted translations when requested', () => {
      const filtered = filterPushDiff(fullDiff, true);

      expect(filtered.en.added).toEqual(fullDiff.en.added);
      expect(filtered.en.modified).toEqual(fullDiff.en.modified);
      expect(filtered.en.deleted).toEqual(fullDiff.en.deleted);
    });
  });

  describe('filterPullDiff', () => {
    it('should return the diff unchanged', () => {
      const diff = {
        en: {
          added: { key1: createTranslation('added') },
          modified: {
            key2: {
              local: createTranslation('new'),
              remote: createTranslation('old'),
            },
          },
          deleted: { key3: createTranslation('deleted') },
          same: {},
        },
      };

      const filtered = filterPullDiff(diff);

      expect(filtered).toEqual(diff);
    });
  });
});

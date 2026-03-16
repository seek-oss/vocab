import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createOrUpdateKey,
  createOrUpdateTranslation,
  deleteKey,
  pushTranslationsWithDiff,
} from './phrase-api';
import { callPhrase } from './phrase-api/call-phrase';
import type { DiffByLanguage } from './diff-utils';
import type { TranslationsByLanguage } from '@vocab/core';

vi.mock('./phrase-api/call-phrase', () => ({
  callPhrase: vi.fn(),
}));

describe('phrase-api diff functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrUpdateKey', () => {
    it('should create a new key successfully', async () => {
      const mockResult = { id: 'key123', name: 'test.key' };
      vi.mocked(callPhrase).mockResolvedValueOnce(mockResult);

      const result = await createOrUpdateKey(
        'test.key',
        { description: 'Test description', tags: ['tag1', 'tag2'] },
        'main',
      );

      expect(result).toEqual(mockResult);
      expect(callPhrase).toHaveBeenCalledWith('keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'test.key',
          branch: 'main',
          description: 'Test description',
          tags: 'tag1,tag2',
        }),
      });
    });

    it('should update existing key when creation fails', async () => {
      const existingKey = { id: 'key123', name: 'test.key' };
      const updatedKey = { id: 'key123', name: 'test.key' };

      // First call fails (key exists), second call returns existing keys, third call updates
      vi.mocked(callPhrase)
        .mockRejectedValueOnce(new Error('Key already exists'))
        .mockResolvedValueOnce([existingKey])
        .mockResolvedValueOnce(updatedKey);

      const result = await createOrUpdateKey(
        'test.key',
        { description: 'Updated description' },
        'main',
      );

      expect(result).toEqual(updatedKey);
      expect(callPhrase).toHaveBeenCalledTimes(3);
    });
  });

  describe('createOrUpdateTranslation', () => {
    it('should create a new translation successfully', async () => {
      const mockLocales = [{ id: 'locale123', code: 'en' }];
      const mockResult = { id: 'trans123', content: 'Hello' };

      vi.mocked(callPhrase)
        .mockResolvedValueOnce(mockLocales)
        .mockResolvedValueOnce(mockResult);

      const result = await createOrUpdateTranslation(
        'key123',
        'en',
        'Hello',
        'main',
      );

      expect(result).toEqual(mockResult);
      expect(callPhrase).toHaveBeenCalledWith('locales');
      expect(callPhrase).toHaveBeenCalledWith('keys/key123/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: 'main',
          content: 'Hello',
          locale_id: 'locale123',
        }),
      });
    });
  });

  describe('deleteKey', () => {
    it('should delete a key successfully', async () => {
      vi.mocked(callPhrase).mockResolvedValueOnce(undefined);

      await deleteKey('key123', 'main');

      expect(callPhrase).toHaveBeenCalledWith('keys/key123?branch=main', {
        method: 'DELETE',
      });
    });
  });

  describe('pushTranslationsWithDiff', () => {
    it('should process added translations correctly', async () => {
      const translationsByLanguage: TranslationsByLanguage = {
        en: {
          'test.key': {
            message: 'Hello',
            description: 'Test key',
            tags: ['test'],
          },
        },
      };

      const diff: DiffByLanguage = {
        en: {
          added: {
            'test.key': {
              message: 'Hello',
              description: 'Test key',
              tags: ['test'],
            },
          },
          modified: {},
          deleted: {},
          same: {},
        },
      };

      const mockLocales = [{ id: 'locale123', code: 'en' }];
      const mockKey = { id: 'key123', name: 'test.key' };
      const mockTranslation = { id: 'trans123', content: 'Hello' };

      vi.mocked(callPhrase)
        .mockResolvedValueOnce(mockKey) // createOrUpdateKey
        .mockResolvedValueOnce(mockLocales) // get locales
        .mockResolvedValueOnce(mockTranslation); // createOrUpdateTranslation

      const result = await pushTranslationsWithDiff(
        translationsByLanguage,
        { devLanguage: 'en', branch: 'main' },
        diff,
      );

      expect(result).toEqual({ success: true });
      expect(callPhrase).toHaveBeenCalledTimes(3);
    });

    it('should skip languages with no diff', async () => {
      const translationsByLanguage: TranslationsByLanguage = {
        en: {},
        fr: {},
      };

      const diff: DiffByLanguage = {};

      const result = await pushTranslationsWithDiff(
        translationsByLanguage,
        { devLanguage: 'en', branch: 'main' },
        diff,
      );

      expect(result).toEqual({ success: true });
      expect(callPhrase).not.toHaveBeenCalled();
    });
  });
});

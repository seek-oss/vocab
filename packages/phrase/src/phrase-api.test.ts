import { vi } from 'vitest';
import type { TranslationsByLanguage } from '@vocab/core';
import { pushTranslations } from './phrase-api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const getFormDataEntries = (call: [unknown, { body: FormData }]) =>
  [...call[1].body.entries()].filter(([key]) => key !== 'file');

describe('phrase-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.PHRASE_API_TOKEN = 'test-token';
    process.env.PHRASE_PROJECT_ID = 'test-project-id';
  });

  describe('pushTranslations', () => {
    const mockTranslations: TranslationsByLanguage = {
      en: {
        hello: { message: 'Hello' },
        world: { message: 'World' },
      },
      fr: {
        hello: { message: 'Bonjour' },
        world: { message: 'Monde' },
      },
    };

    const mockUploadResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        get: vi.fn(() => null),
      },
      json: vi.fn(() => Promise.resolve({ id: 'upload-123' })),
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue(mockUploadResponse);
    });

    it('should upload translations for each language', async () => {
      const result = await pushTranslations(mockTranslations, {
        branch: 'test-branch',
        devLanguage: 'en',
      });

      expect(mockFetch).toHaveBeenCalledTimes(2); // One call per language
      expect(result).toEqual({ devLanguageUploadId: 'upload-123' });

      const firstCall = mockFetch.mock.calls[0];
      expect(firstCall[0]).toBe(
        'https://api.phrase.com/v2/projects/test-project-id/uploads',
      );

      // Check that fetch was called with correct FormData
      expect(getFormDataEntries(firstCall as any)).toMatchInlineSnapshot(`
        [
          [
            "file_format",
            "csv",
          ],
          [
            "branch",
            "test-branch",
          ],
          [
            "update_translations",
            "true",
          ],
          [
            "update_descriptions",
            "true",
          ],
          [
            "locale_mapping[en]",
            "4",
          ],
          [
            "format_options[key_index]",
            "1",
          ],
          [
            "format_options[comment_index]",
            "2",
          ],
          [
            "format_options[tag_column]",
            "3",
          ],
          [
            "format_options[enable_pluralization]",
            "false",
          ],
        ]
      `);
    });

    it('should include autoTranslate parameter when enabled', async () => {
      await pushTranslations(mockTranslations, {
        branch: 'test-branch',
        devLanguage: 'en',
        autoTranslate: true,
      });

      const firstCall = mockFetch.mock.calls[0];
      expect(getFormDataEntries(firstCall as any)).toMatchInlineSnapshot(`
        [
          [
            "file_format",
            "csv",
          ],
          [
            "branch",
            "test-branch",
          ],
          [
            "update_translations",
            "true",
          ],
          [
            "update_descriptions",
            "true",
          ],
          [
            "autotranslate",
            "true",
          ],
          [
            "locale_mapping[en]",
            "4",
          ],
          [
            "format_options[key_index]",
            "1",
          ],
          [
            "format_options[comment_index]",
            "2",
          ],
          [
            "format_options[tag_column]",
            "3",
          ],
          [
            "format_options[enable_pluralization]",
            "false",
          ],
        ]
      `);
    });
  });
});

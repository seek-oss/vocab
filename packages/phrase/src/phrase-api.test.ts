import { vi } from 'vitest';
import type { TranslationsByLanguage } from '@vocab/core';
import { pushTranslations } from './phrase-api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

      // Check that fetch was called with correct FormData
      const firstCall = mockFetch.mock.calls[0];
      expect(firstCall).toMatchInlineSnapshot(`
        [
          "https://api.phrase.com/v2/projects/test-project-id/uploads",
          {
            "body": FormData {
              Symbol(state): [
                {
                  "name": "file",
                  "value": File {
                    Symbol(kHandle): Blob {},
                    Symbol(kLength): 28,
                    Symbol(kType): "text/csv",
                  },
                },
                {
                  "name": "file_format",
                  "value": "csv",
                },
                {
                  "name": "branch",
                  "value": "test-branch",
                },
                {
                  "name": "update_translations",
                  "value": "true",
                },
                {
                  "name": "update_descriptions",
                  "value": "true",
                },
                {
                  "name": "locale_mapping[en]",
                  "value": "4",
                },
                {
                  "name": "format_options[key_index]",
                  "value": "1",
                },
                {
                  "name": "format_options[comment_index]",
                  "value": "2",
                },
                {
                  "name": "format_options[tag_column]",
                  "value": "3",
                },
                {
                  "name": "format_options[enable_pluralization]",
                  "value": "false",
                },
              ],
            },
            "headers": {
              "Authorization": "token test-token",
              "User-Agent": "Vocab Client (https://github.com/seek-oss/vocab)",
            },
            "method": "POST",
          },
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
      expect(firstCall[1].body).toMatchInlineSnapshot(`
        FormData {
          Symbol(state): [
            {
              "name": "file",
              "value": File {
                Symbol(kHandle): Blob {},
                Symbol(kLength): 28,
                Symbol(kType): "text/csv",
              },
            },
            {
              "name": "file_format",
              "value": "csv",
            },
            {
              "name": "branch",
              "value": "test-branch",
            },
            {
              "name": "update_translations",
              "value": "true",
            },
            {
              "name": "update_descriptions",
              "value": "true",
            },
            {
              "name": "autoTranslate",
              "value": "true",
            },
            {
              "name": "locale_mapping[en]",
              "value": "4",
            },
            {
              "name": "format_options[key_index]",
              "value": "1",
            },
            {
              "name": "format_options[comment_index]",
              "value": "2",
            },
            {
              "name": "format_options[tag_column]",
              "value": "3",
            },
            {
              "name": "format_options[enable_pluralization]",
              "value": "false",
            },
          ],
        }
      `);
    });
  });
});

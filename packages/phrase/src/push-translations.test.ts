import path from 'path';
import { vi } from 'vitest';
import { push } from './push-translations';
import {
  pushTranslationsWithDiff,
  pullAllTranslations,
  deleteUnusedKeys,
} from './phrase-api';
import { writeFile } from './file';

vi.mock('./file', () => ({
  writeFile: vi.fn(() => Promise.resolve),
  mkdir: vi.fn(() => Promise.resolve),
}));

vi.mock('./phrase-api', () => ({
  ensureBranch: vi.fn(() => Promise.resolve()),
  pushTranslations: vi.fn(() => Promise.resolve({ uploadId: '1234' })),
  pushTranslationsWithDiff: vi.fn(() => Promise.resolve({ success: true })),
  pullAllTranslations: vi.fn(() => Promise.resolve({})),
  deleteUnusedKeys: vi.fn(() => Promise.resolve()),
}));

vi.mock('./prompt-utils', () => ({
  promptConfirmation: vi.fn(() => Promise.resolve(true)),
}));

function runPhrase(config: {
  autoTranslate?: boolean;
  deleteUnusedKeys: boolean;
  ignore?: string[];
}) {
  return push(
    {
      autoTranslate: config.autoTranslate,
      branch: 'tester',
      deleteUnusedKeys: config.deleteUnusedKeys,
      ignore: config.ignore || [],
    },
    {
      devLanguage: 'en',
      languages: [{ name: 'en' }, { name: 'fr' }],
      generatedLanguages: [
        {
          name: 'generatedLanguage',
          extends: 'en',
          generator: {
            transformMessage: (message: string) => `[${message}]`,
          },
        },
      ],
      projectRoot: path.resolve(__dirname, '..', '..', '..', 'fixtures/phrase'),
    },
  );
}

describe('push', () => {
  describe('when deleteUnusedKeys is false', () => {
    const config = { deleteUnusedKeys: false };

    beforeEach(() => {
      vi.mocked(pushTranslationsWithDiff).mockClear();
      vi.mocked(pullAllTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();
    });

    it('should resolve', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pullAllTranslations)).toHaveBeenCalledWith('tester');
      expect(vi.mocked(pushTranslationsWithDiff)).toHaveBeenCalledTimes(1);
    });

    it('should update keys', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslationsWithDiff).mock.calls[0][0])
        .toMatchInlineSnapshot(`
          {
            "en": {
              "app.thanks.label": {
                "globalKey": "app.thanks.label",
                "message": "Thanks",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "excluded.mytranslations": {
                "message": "this is excluded",
                "tags": [],
              },
              "hello.": {
                "message": "Hi there",
                "tags": [
                  "only for this key",
                  "greeting",
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "hello.mytranslations": {
                "message": "Hi there",
                "tags": [],
              },
              "profile.": {
                "message": "profil",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "world.": {
                "message": "world",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
            },
            "fr": {},
          }
        `);
    });

    it('should not delete unused keys', () => {
      expect(deleteUnusedKeys).not.toHaveBeenCalled();
    });
  });

  describe('when deleteUnusedKeys is true', () => {
    const config = { deleteUnusedKeys: true };

    beforeEach(() => {
      vi.mocked(pushTranslationsWithDiff).mockClear();
      vi.mocked(pullAllTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();
    });

    describe('and the upload succeeds', () => {
      it('should resolve', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(vi.mocked(pushTranslationsWithDiff)).toHaveBeenCalledTimes(1);
      });

      it('should update keys', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(vi.mocked(pushTranslationsWithDiff).mock.calls[0][0])
          .toMatchInlineSnapshot(`
            {
              "en": {
                "app.thanks.label": {
                  "globalKey": "app.thanks.label",
                  "message": "Thanks",
                  "tags": [
                    "every",
                    "key",
                    "gets",
                    "these",
                    "tags",
                  ],
                },
                "excluded.mytranslations": {
                  "message": "this is excluded",
                  "tags": [],
                },
                "hello.": {
                  "message": "Hi there",
                  "tags": [
                    "only for this key",
                    "greeting",
                    "every",
                    "key",
                    "gets",
                    "these",
                    "tags",
                  ],
                },
                "hello.mytranslations": {
                  "message": "Hi there",
                  "tags": [],
                },
                "profile.": {
                  "message": "profil",
                  "tags": [
                    "every",
                    "key",
                    "gets",
                    "these",
                    "tags",
                  ],
                },
                "world.": {
                  "message": "world",
                  "tags": [
                    "every",
                    "key",
                    "gets",
                    "these",
                    "tags",
                  ],
                },
              },
              "fr": {},
            }
          `);
      });

      it('should push successfully (deleted keys are removed via diff-based push, not deleteUnusedKeys)', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        // Diff-based push handles deleted keys via deleteKey per key; deleteUnusedKeys is not used
        expect(deleteUnusedKeys).not.toHaveBeenCalled();
      });
    });

    describe('and the upload fails', () => {
      beforeEach(() => {
        vi.mocked(pushTranslationsWithDiff).mockImplementation(() =>
          Promise.reject(new Error('Upload failed')),
        );
      });

      it('should not delete unused keys', async () => {
        await expect(runPhrase(config)).rejects.toThrow('Upload failed');

        expect(deleteUnusedKeys).not.toHaveBeenCalled();
      });
    });
  });

  describe('when ignore is ["**/ignore.vocab/**"]', () => {
    const config = { deleteUnusedKeys: false, ignore: ['**/ignore.vocab/**'] };

    beforeEach(() => {
      vi.mocked(pushTranslationsWithDiff).mockClear();
      vi.mocked(pullAllTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();
    });

    it('should resolve', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslationsWithDiff)).toHaveBeenCalledTimes(1);
    });

    it('should update keys', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslationsWithDiff).mock.calls[0][0])
        .toMatchInlineSnapshot(`
          {
            "en": {
              "app.thanks.label": {
                "globalKey": "app.thanks.label",
                "message": "Thanks",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "excluded.mytranslations": {
                "message": "this is excluded",
                "tags": [],
              },
              "hello.": {
                "message": "Hi there",
                "tags": [
                  "only for this key",
                  "greeting",
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "hello.mytranslations": {
                "message": "Hi there",
                "tags": [],
              },
              "profile.": {
                "message": "profil",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "world.": {
                "message": "world",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
            },
            "fr": {},
          }
        `);
    });
  });

  describe('when autoTranslate is enabled', () => {
    const config = { autoTranslate: true, deleteUnusedKeys: false };

    beforeEach(() => {
      vi.mocked(pushTranslationsWithDiff).mockClear();
      vi.mocked(pullAllTranslations).mockClear();
    });

    it('should call pushTranslationsWithDiff', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslationsWithDiff)).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          devLanguage: 'en',
          branch: 'tester',
        }),
        expect.any(Object),
      );
    });
  });
});

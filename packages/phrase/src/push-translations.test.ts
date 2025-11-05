import path from 'path';
import { vi } from 'vitest';
import { push } from './push-translations';
import { pushTranslations, deleteUnusedKeys } from './phrase-api';
import { writeFile } from './file';

vi.mock('./file', () => ({
  writeFile: vi.fn(() => Promise.resolve),
  mkdir: vi.fn(() => Promise.resolve),
}));

vi.mock('./phrase-api', () => ({
  ensureBranch: vi.fn(() => Promise.resolve()),
  pushTranslations: vi.fn(() => Promise.resolve({ uploadId: '1234' })),
  deleteUnusedKeys: vi.fn(() => Promise.resolve()),
}));

const devLanguageUploadId = '1234';

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
      vi.mocked(pushTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();

      vi.mocked(pushTranslations).mockImplementation(() =>
        Promise.resolve({ devLanguageUploadId }),
      );
    });

    it('should resolve', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslations)).toHaveBeenCalledTimes(1);
    });

    it('should update keys', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslations).mock.calls[0][0])
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
            "excluded.ignore": {
              "message": "this is excluded",
              "tags": [],
            },
            "hello.mytranslations": {
              "message": "Hello",
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
            "profile.mytranslations": {
              "message": "profil",
              "tags": [
                "every",
                "key",
                "gets",
                "these",
                "tags",
              ],
            },
            "world.mytranslations": {
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
          "fr": {
            "hello.mytranslations": {
              "description": undefined,
              "message": "Bonjour",
            },
            "profile.mytranslations": {
              "description": undefined,
              "message": "profil",
            },
            "world.mytranslations": {
              "description": undefined,
              "message": "monde",
            },
          },
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
      vi.mocked(pushTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();
    });

    describe('and the upload succeeds', () => {
      beforeEach(() => {
        vi.mocked(pushTranslations).mockImplementation(() =>
          Promise.resolve({ devLanguageUploadId }),
        );
      });

      it('should resolve', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(vi.mocked(pushTranslations)).toHaveBeenCalledTimes(1);
      });

      it('should update keys', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(vi.mocked(pushTranslations).mock.calls[0][0])
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
              "excluded.ignore": {
                "message": "this is excluded",
                "tags": [],
              },
              "hello.mytranslations": {
                "message": "Hello",
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
              "profile.mytranslations": {
                "message": "profil",
                "tags": [
                  "every",
                  "key",
                  "gets",
                  "these",
                  "tags",
                ],
              },
              "world.mytranslations": {
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
            "fr": {
              "hello.mytranslations": {
                "description": undefined,
                "message": "Bonjour",
              },
              "profile.mytranslations": {
                "description": undefined,
                "message": "profil",
              },
              "world.mytranslations": {
                "description": undefined,
                "message": "monde",
              },
            },
          }
        `);
      });

      it('should delete unused keys', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(deleteUnusedKeys).toHaveBeenCalledWith(
          devLanguageUploadId,
          'tester',
        );
      });
    });

    describe('and the upload fails', () => {
      beforeEach(() => {
        vi.mocked(pushTranslations).mockImplementation(() =>
          Promise.reject('Upload failed'),
        );
      });

      it('should not delete unused keys', async () => {
        await expect(runPhrase(config)).rejects.toBe('Upload failed');

        expect(deleteUnusedKeys).not.toHaveBeenCalled();
      });
    });
  });

  describe('when ignore is ["**/ignore.vocab/**"]', () => {
    const config = { deleteUnusedKeys: false, ignore: ['**/ignore.vocab/**'] };

    beforeEach(() => {
      vi.mocked(pushTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();

      vi.mocked(pushTranslations).mockImplementation(() =>
        Promise.resolve({ devLanguageUploadId }),
      );
    });

    it('should resolve', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslations)).toHaveBeenCalledTimes(1);
    });

    it('should update keys', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(vi.mocked(pushTranslations).mock.calls[0][0])
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
            "hello.mytranslations": {
              "message": "Hello",
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
            "profile.mytranslations": {
              "message": "profil",
              "tags": [
                "every",
                "key",
                "gets",
                "these",
                "tags",
              ],
            },
            "world.mytranslations": {
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
          "fr": {
            "hello.mytranslations": {
              "description": undefined,
              "message": "Bonjour",
            },
            "profile.mytranslations": {
              "description": undefined,
              "message": "profil",
            },
            "world.mytranslations": {
              "description": undefined,
              "message": "monde",
            },
          },
        }
      `);
    });
  });

  describe('when autoTranslate is enabled', () => {
    const config = { autoTranslate: true, deleteUnusedKeys: false };

    beforeEach(() => {
      vi.mocked(pushTranslations).mockClear();
      vi.mocked(writeFile).mockClear();
      vi.mocked(deleteUnusedKeys).mockClear();

      vi.mocked(pushTranslations).mockImplementation(() =>
        Promise.resolve({ devLanguageUploadId }),
      );
    });

    it('should pass autoTranslate parameter to pushTranslations', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      // Check that pushTranslations was called with the correct parameters
      expect(vi.mocked(pushTranslations)).toHaveBeenCalledWith(
        expect.any(Object), // translations data
        expect.objectContaining({
          devLanguage: 'en',
          branch: 'tester',
          autoTranslate: true,
        }),
      );
    });
  });
});

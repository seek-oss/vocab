import path from 'path';
import { push } from './push-translations';
import { pushTranslations, deleteUnusedKeys } from './phrase-api';
import { writeFile } from './file';

jest.mock('./file', () => ({
  writeFile: jest.fn(() => Promise.resolve),
  mkdir: jest.fn(() => Promise.resolve),
}));

jest.mock('./phrase-api', () => ({
  ensureBranch: jest.fn(() => Promise.resolve()),
  pushTranslations: jest.fn(() => Promise.resolve({ uploadId: '1234' })),
  deleteUnusedKeys: jest.fn(() => Promise.resolve()),
}));

const devLanguageUploadId = '1234';

function runPhrase(config: { deleteUnusedKeys: boolean }) {
  return push(
    { branch: 'tester', deleteUnusedKeys: config.deleteUnusedKeys },
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
      jest.mocked(pushTranslations).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(deleteUnusedKeys).mockClear();

      jest
        .mocked(pushTranslations)
        .mockImplementation(() => Promise.resolve({ devLanguageUploadId }));
    });

    it('should resolve', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(jest.mocked(pushTranslations)).toHaveBeenCalledTimes(1);
    });

    it('should update keys', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(jest.mocked(pushTranslations).mock.calls[0][0])
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

    it('should not delete unused keys', () => {
      expect(deleteUnusedKeys).not.toHaveBeenCalled();
    });
  });

  describe('when deleteUnusedKeys is true', () => {
    const config = { deleteUnusedKeys: true };

    beforeEach(() => {
      jest.mocked(pushTranslations).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(deleteUnusedKeys).mockClear();
    });

    describe('and the upload succeeds', () => {
      beforeEach(() => {
        jest
          .mocked(pushTranslations)
          .mockImplementation(() => Promise.resolve({ devLanguageUploadId }));
      });

      it('should resolve', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(jest.mocked(pushTranslations)).toHaveBeenCalledTimes(1);
      });

      it('should update keys', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(jest.mocked(pushTranslations).mock.calls[0][0])
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
        jest
          .mocked(pushTranslations)
          .mockImplementation(() => Promise.reject('Upload failed'));
      });

      it('should not delete unused keys', async () => {
        await expect(runPhrase(config)).rejects.toBe('Upload failed');

        expect(deleteUnusedKeys).not.toHaveBeenCalled();
      });
    });
  });
});

import path from 'path';
import { push } from './push-translations';
import { pushTranslationsByLocale, deleteUnusedKeys } from './phrase-api';
import { writeFile } from './file';

jest.mock('./file', () => ({
  writeFile: jest.fn(() => Promise.resolve),
  mkdir: jest.fn(() => Promise.resolve),
}));

jest.mock('./phrase-api', () => ({
  ensureBranch: jest.fn(() => Promise.resolve()),
  pushTranslationsByLocale: jest.fn(() => Promise.resolve({ en: {}, fr: {} })),
  deleteUnusedKeys: jest.fn(() => Promise.resolve()),
}));

const uploadId = '1234';

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
      jest.mocked(pushTranslationsByLocale).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(deleteUnusedKeys).mockClear();

      jest
        .mocked(pushTranslationsByLocale)
        .mockImplementation(() => Promise.resolve({ uploadId }));
    });

    it('should resolve', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(jest.mocked(pushTranslationsByLocale)).toHaveBeenCalledTimes(2);
    });

    it('should update keys', async () => {
      await expect(runPhrase(config)).resolves.toBeUndefined();

      expect(jest.mocked(pushTranslationsByLocale)).toHaveBeenCalledWith(
        {
          'hello.mytranslations': {
            message: 'Hello',
          },
          'world.mytranslations': {
            message: 'world',
          },
        },
        'en',
        'tester',
      );

      expect(jest.mocked(pushTranslationsByLocale)).toHaveBeenCalledWith(
        {
          'hello.mytranslations': {
            message: 'Bonjour',
          },
          'world.mytranslations': {
            message: 'monde',
          },
        },
        'fr',
        'tester',
      );
    });

    it('should not delete unused keys', () => {
      expect(deleteUnusedKeys).not.toHaveBeenCalled();
    });
  });

  describe('when deleteUnusedKeys is true', () => {
    const config = { deleteUnusedKeys: true };

    beforeEach(() => {
      jest.mocked(pushTranslationsByLocale).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(deleteUnusedKeys).mockClear();
    });

    describe('and the upload succeeds', () => {
      beforeEach(() => {
        jest
          .mocked(pushTranslationsByLocale)
          .mockImplementation(() => Promise.resolve({ uploadId }));
      });

      it('should resolve', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(jest.mocked(pushTranslationsByLocale)).toHaveBeenCalledTimes(2);
      });

      it('should update keys', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(jest.mocked(pushTranslationsByLocale)).toHaveBeenCalledWith(
          {
            'hello.mytranslations': {
              message: 'Hello',
            },
            'world.mytranslations': {
              message: 'world',
            },
          },
          'en',
          'tester',
        );

        expect(jest.mocked(pushTranslationsByLocale)).toHaveBeenCalledWith(
          {
            'hello.mytranslations': {
              message: 'Bonjour',
            },
            'world.mytranslations': {
              message: 'monde',
            },
          },
          'fr',
          'tester',
        );
      });

      it('should delete unused keys', async () => {
        await expect(runPhrase(config)).resolves.toBeUndefined();

        expect(deleteUnusedKeys).toHaveBeenCalledWith(uploadId, 'en', 'tester');
        expect(deleteUnusedKeys).toHaveBeenCalledWith(uploadId, 'fr', 'tester');
      });
    });

    describe('and the upload fails', () => {
      beforeEach(() => {
        jest
          .mocked(pushTranslationsByLocale)
          .mockImplementation(() => Promise.reject('Upload failed'));
      });

      it('should not delete unused keys', async () => {
        await expect(runPhrase(config)).rejects.toBe('Upload failed');

        expect(deleteUnusedKeys).not.toHaveBeenCalled();
      });
    });
  });
});

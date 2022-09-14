import path from 'path';
import { pull } from './pull-translations';
import { pullAllTranslations } from './phrase-api';
import { writeFile } from './file';
import { GeneratedLanguageTarget, LanguageTarget } from '@vocab/types';

jest.mock('./file', () => ({
  writeFile: jest.fn(() => Promise.resolve),
  mkdir: jest.fn(() => Promise.resolve),
}));

jest.mock('./phrase-api', () => ({
  ensureBranch: jest.fn(() => Promise.resolve()),
  pullAllTranslations: jest.fn(() => Promise.resolve({ en: {}, fr: {} })),
}));

const devLanguage = 'en';

function runPhrase(options: {
  languages: LanguageTarget[];
  generatedLanguages: GeneratedLanguageTarget[];
}) {
  return pull(
    { branch: 'tester' },
    {
      ...options,
      devLanguage,
      projectRoot: path.resolve(__dirname, '..', '..', '..', 'fixtures/phrase'),
    },
  );
}

describe('pull translations', () => {
  describe('when pulling translations for languages that already have translations', () => {
    beforeEach(() => {
      (pullAllTranslations as jest.Mock).mockClear();
      (writeFile as jest.Mock).mockClear();
      (pullAllTranslations as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          en: {
            'hello.mytranslations': {
              message: 'Hi there',
            },
          },
          fr: {
            'hello.mytranslations': {
              message: 'merci',
            },
          },
        }),
      );
    });

    const options = {
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
    };

    it('should resolve', async () => {
      await expect(runPhrase(options)).resolves.toBeUndefined();

      expect(writeFile as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('should update keys', async () => {
      await expect(runPhrase(options)).resolves.toBeUndefined();

      expect(
        (writeFile as jest.Mock).mock.calls.map(
          ([_filePath, contents]: [string, string]) => JSON.parse(contents),
        ),
      ).toMatchInlineSnapshot(`
      Array [
        Object {
          "hello": Object {
            "message": "Hi there",
          },
          "world": Object {
            "message": "world",
          },
        },
        Object {
          "hello": Object {
            "message": "merci",
          },
          "world": Object {
            "message": "monde",
          },
        },
      ]
    `);
    });
  });

  describe('when pulling translations and some languages do not have any translations', () => {
    beforeEach(() => {
      (pullAllTranslations as jest.Mock).mockClear();
      (writeFile as jest.Mock).mockClear();
      (pullAllTranslations as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          en: {
            'hello.mytranslations': {
              message: 'Hi there',
            },
          },
          fr: {
            'hello.mytranslations': {
              message: 'merci',
            },
          },
        }),
      );
    });

    const options = {
      languages: [{ name: 'en' }, { name: 'fr' }, { name: 'ja' }],
      generatedLanguages: [
        {
          name: 'generatedLanguage',
          extends: 'en',
          generator: {
            transformMessage: (message: string) => `[${message}]`,
          },
        },
      ],
    };

    it('should resolve', async () => {
      await expect(runPhrase(options)).resolves.toBeUndefined();

      expect(writeFile as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('should update keys', async () => {
      await expect(runPhrase(options)).resolves.toBeUndefined();

      expect(
        (writeFile as jest.Mock).mock.calls.map(
          ([_filePath, contents]: [string, string]) => JSON.parse(contents),
        ),
      ).toMatchInlineSnapshot(`
      Array [
        Object {
          "hello": Object {
            "message": "Hi there",
          },
          "world": Object {
            "message": "world",
          },
        },
        Object {
          "hello": Object {
            "message": "merci",
          },
          "world": Object {
            "message": "monde",
          },
        },
      ]
    `);
    });
  });

  describe('when pulling translations and the project has not configured translations for the dev language', () => {
    beforeEach(() => {
      (pullAllTranslations as jest.Mock).mockClear();
      (writeFile as jest.Mock).mockClear();
      (pullAllTranslations as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          fr: {
            'hello.mytranslations': {
              message: 'merci',
            },
          },
        }),
      );
    });

    const options = {
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
    };

    it('should throw an error', async () => {
      await expect(runPhrase(options)).rejects.toThrowError(
        new Error(
          'Phrase did not return any translations for dev language "en".\nEnsure you have configured your Phrase project for your dev language, and have pushed your translations.',
        ),
      );

      expect(writeFile as jest.Mock).toHaveBeenCalledTimes(0);
    });
  });

  describe('when pulling translations and there are no translations for the dev language', () => {
    beforeEach(() => {
      (pullAllTranslations as jest.Mock).mockClear();
      (writeFile as jest.Mock).mockClear();
      (pullAllTranslations as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          en: {},
          fr: {
            'hello.mytranslations': {
              message: 'merci',
            },
          },
        }),
      );
    });

    const options = {
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
    };

    it('should throw an error', async () => {
      await expect(runPhrase(options)).rejects.toThrowError(
        new Error(
          'Phrase did not return any translations for dev language "en".\nEnsure you have configured your Phrase project for your dev language, and have pushed your translations.',
        ),
      );

      expect(writeFile as jest.Mock).toHaveBeenCalledTimes(0);
    });
  });
});

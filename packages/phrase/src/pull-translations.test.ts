import path from 'path';
import { pull } from './pull-translations';
import { pullAllTranslations } from './phrase-api';
import { writeFile } from './file';
import type { GeneratedLanguageTarget, LanguageTarget } from '@vocab/core';

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
  errorOnNoGlobalKeyTranslation?: boolean;
}) {
  return pull(
    {
      branch: 'tester',
      errorOnNoGlobalKeyTranslation: options.errorOnNoGlobalKeyTranslation,
    },
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
      jest.mocked(pullAllTranslations).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(pullAllTranslations).mockImplementation(() =>
        Promise.resolve({
          en: {
            'hello.mytranslations': {
              message: 'Hi there',
            },
            'app.thanks.label': {
              message: 'Thank you.',
            },
          },
          fr: {
            'hello.mytranslations': {
              message: 'merci',
            },
            'app.thanks.label': {
              message: 'Merci.',
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

      expect(jest.mocked(writeFile)).toHaveBeenCalledTimes(2);
    });

    it('should update keys', async () => {
      await expect(runPhrase(options)).resolves.toBeUndefined();

      expect(
        jest
          .mocked(writeFile)
          .mock.calls.map(([_filePath, contents]) =>
            JSON.parse(contents as string),
          ),
      ).toMatchInlineSnapshot(`
        [
          {
            "_meta": {
              "tags": [
                "every",
                "key",
                "gets",
                "these",
                "tags",
              ],
            },
            "hello": {
              "message": "Hi there",
              "tags": [
                "only for this key",
                "greeting",
              ],
            },
            "profile": {
              "message": "profil",
            },
            "thanks": {
              "globalKey": "app.thanks.label",
              "message": "Thank you.",
            },
            "world": {
              "message": "world",
            },
          },
          {
            "hello": {
              "message": "merci",
            },
            "profile": {
              "message": "profil",
            },
            "thanks": {
              "message": "Merci.",
            },
            "world": {
              "message": "monde",
            },
          },
        ]
      `);
    });
  });

  describe('when pulling translations and some languages do not have any translations', () => {
    beforeEach(() => {
      jest.mocked(pullAllTranslations).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(pullAllTranslations).mockImplementation(() =>
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

      expect(jest.mocked(writeFile)).toHaveBeenCalledTimes(2);
    });

    it('should update keys', async () => {
      await expect(runPhrase(options)).resolves.toBeUndefined();

      expect(
        jest
          .mocked(writeFile)
          .mock.calls.map(([_filePath, contents]) =>
            JSON.parse(contents as string),
          ),
      ).toMatchInlineSnapshot(`
        [
          {
            "_meta": {
              "tags": [
                "every",
                "key",
                "gets",
                "these",
                "tags",
              ],
            },
            "hello": {
              "message": "Hi there",
              "tags": [
                "only for this key",
                "greeting",
              ],
            },
            "profile": {
              "message": "profil",
            },
            "thanks": {
              "globalKey": "app.thanks.label",
              "message": "Thanks",
            },
            "world": {
              "message": "world",
            },
          },
          {
            "hello": {
              "message": "merci",
            },
            "profile": {
              "message": "profil",
            },
            "world": {
              "message": "monde",
            },
          },
        ]
      `);
    });
  });

  describe('when pulling translations and the project has not configured translations for the dev language', () => {
    beforeEach(() => {
      jest.mocked(pullAllTranslations).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(pullAllTranslations).mockImplementation(() =>
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
      await expect(runPhrase(options)).rejects.toThrow(
        new Error(
          `Phrase did not return any translations for the configured development language "en".\nPlease ensure this language is present in your Phrase project's configuration.`,
        ),
      );

      expect(jest.mocked(writeFile)).toHaveBeenCalledTimes(0);
    });
  });

  describe('when pulling translations and some global keys do not have any translations', () => {
    beforeEach(() => {
      jest.mocked(pullAllTranslations).mockClear();
      jest.mocked(writeFile).mockClear();
      jest.mocked(pullAllTranslations).mockImplementation(() =>
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
      errorOnNoGlobalKeyTranslation: true,
    };

    it('should throw an error', async () => {
      await expect(runPhrase(options)).rejects.toThrow(
        new Error(`Missing translation for global key thanks in language fr`),
      );

      expect(jest.mocked(writeFile)).toHaveBeenCalledTimes(1);
    });
  });
});

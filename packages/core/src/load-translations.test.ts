import {
  getFallbackLanguageOrder,
  getLanguageHierarchy,
  loadAltLanguageFile,
  loadTranslation,
  mergeWithDevLanguageTranslation,
} from './load-translations';
import path from 'path';

describe('mergeWithDevLanguage', () => {
  const key = 'Hello';

  describe('when the translation has a message for a key in the dev translation', () => {
    it('should have a message from the translation', () => {
      const thTranslation = { Hello: { message: 'Hello in Thai' } };
      const devTranslation = { Hello: { message: 'Hello' } };

      const mergedTranslations = mergeWithDevLanguageTranslation({
        translation: thTranslation,
        devTranslation,
      });

      expect(mergedTranslations[key]).toEqual({ message: 'Hello in Thai' });
    });
  });

  describe('when the translation does not have a message for a key in the dev translation', () => {
    it('should not have a message for the given key', () => {
      const translation = {};
      const devTranslation = { Hello: { message: 'Hello' } };

      const mergedTranslations = mergeWithDevLanguageTranslation({
        translation,
        devTranslation,
      });

      expect(mergedTranslations[key]).toEqual(undefined);
    });
  });
});

describe('getLanguageHierarchy', () => {
  it('should return a correct language hierarchy', () => {
    expect(
      getLanguageHierarchy({
        languages: [
          { name: 'en' },
          { name: 'th', extends: 'en' },
          { name: 'th-TH', extends: 'th' },
          { name: 'en-AU', extends: 'en' },
        ],
      }),
    ).toEqual(
      new Map([
        ['en', []],
        ['th', ['en']],
        ['th-TH', ['th', 'en']],
        ['en-AU', ['en']],
      ]),
    );
  });
});

describe('getFallbackLanguageOrder', () => {
  const languages = [
    { name: 'fr' },
    { name: 'en' },
    { name: 'th', extends: 'en' },
    { name: 'th-TH', extends: 'th' },
  ];
  const languageName = 'th-TH';
  const devLanguage = 'fr';

  describe('fallbacks = none', () => {
    it('should return just the requested language', () => {
      const fallbacks = 'none';

      expect(
        getFallbackLanguageOrder({
          languages,
          languageName,
          devLanguage,
          fallbacks,
        }),
      ).toEqual(['th-TH']);
    });
  });

  describe('fallbacks = valid', () => {
    it('should return just the requested language', () => {
      const fallbacks = 'valid';

      expect(
        getFallbackLanguageOrder({
          languages,
          languageName,
          devLanguage,
          fallbacks,
        }),
      ).toEqual(['en', 'th', 'th-TH']);
    });
  });

  describe('fallbacks = all', () => {
    it('should return just the requested language', () => {
      const fallbacks = 'all';

      expect(
        getFallbackLanguageOrder({
          languages,
          languageName,
          devLanguage,
          fallbacks,
        }),
      ).toEqual(['fr', 'en', 'th', 'th-TH']);
    });
  });
});

describe('loadAltLanguageFile', () => {
  describe('when a language extends a language that also extends another language', () => {
    it('should resolve translation message correctly according to the fallback hierarchy', () => {
      const filePath = path.join(
        __dirname,
        'test-translations/translations.json',
      );
      const devTranslation = {
        Hello: { message: 'Hello in French' },
        Goodbye: {
          message: 'Goodbye in French',
        },
        Welcome: {
          message: 'Welcome in French',
        },
        'Good morning': {
          message: 'Good morning in French',
        },
      };

      const thTHTranslations = loadAltLanguageFile(
        {
          filePath,
          languageName: 'th-TH',
          devTranslation,
          fallbacks: 'all',
        },
        {
          devLanguage: 'fr',
          languages: [
            { name: 'fr' },
            { name: 'en' },
            { name: 'th', extends: 'en' },
            { name: 'th-TH', extends: 'th' },
          ],
        },
      );

      expect(thTHTranslations).toEqual({
        Hello: { message: 'Hello in Thai' },
        Goodbye: { message: 'Goodbye' },
        Welcome: { message: 'Welcome in Thai-TH' },
        'Good morning': { message: 'Good morning in French' },
      });
    });
  });
});

describe('loadTranslation', () => {
  describe('when a generated language config is provided', () => {
    it('should generate a language', () => {
      const generator = {
        transformElement: (element: string) => element.toUpperCase(),
        transformMessage: (message: string) => `[${message}]`,
      };
      const filePath = path.join(
        __dirname,
        'test-translations/translations.json',
      );
      const fallbacks = 'all';
      const userConfig = {
        devLanguage: 'fr',
        languages: [
          { name: 'fr' },
          { name: 'en' },
          { name: 'th', extends: 'en' },
          { name: 'th-TH', extends: 'th' },
        ],
        generatedLanguages: [
          { name: 'capital-english', extends: 'en', generator },
        ],
      };

      const translations = loadTranslation(
        {
          filePath,
          fallbacks,
        },
        userConfig,
      );

      expect(translations.languages['capital-english']).toMatchInlineSnapshot(`
        Object {
          "Good morning": Object {
            "message": "[GOOD MORNING IN FRENCH]",
          },
          "Goodbye": Object {
            "message": "[GOODBYE]",
          },
          "Hello": Object {
            "message": "[HELLO]",
          },
          "Welcome": Object {
            "message": "[WELCOME]",
          },
        }
      `);
    });
  });
});

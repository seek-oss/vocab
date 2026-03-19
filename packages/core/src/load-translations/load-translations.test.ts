import { loadTranslation } from './load-translations';
import {
  getFallbackLanguageOrder,
  getLanguageHierarchy,
} from './language-hierarchy';
import {
  loadAltLanguageFile,
  mergeWithDevLanguageTranslation,
} from './load-separated-translations';
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
        '..',
        'test-translations',
        'translations.json',
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
  const testTranslationsPath = path.join(__dirname, '..', 'test-translations');
  const testTranslationsFilePath = path.join(
    testTranslationsPath,
    'translations.json',
  );

  describe('when a generated language config is provided', () => {
    it('should generate a language', () => {
      const generator = {
        transformElement: (element: string) => element.toUpperCase(),
        transformMessage: (message: string) => `[${message}]`,
      };
      const fallbacks = 'all';
      const userConfig = {
        projectRoot: path.join(__dirname, '..', '..'),
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
          filePath: testTranslationsFilePath,
          fallbacks,
        },
        userConfig,
      );

      const runtime = translations.getRuntimeView();
      expect(runtime.messagesByLanguage['capital-english']).toMatchInlineSnapshot(`
        {
          "Good morning": "[GOOD MORNING IN FRENCH]",
          "Goodbye": "[GOODBYE]",
          "Hello": "[HELLO]",
          "Welcome": "[WELCOME]",
        }
      `);
    });
  });

  describe('tags', () => {
    const userConfig = {
      projectRoot: path.join(__dirname, '..', '..'),
      devLanguage: 'fr',
      languages: [{ name: 'fr' }, { name: 'en' }],
    };

    describe('when withTags is true', () => {
      it('should load translations with tags, ignoring tags in languages that are not the dev language', () => {
        const translations = loadTranslation(
          {
            filePath: testTranslationsFilePath,
            fallbacks: 'all',
            withTags: true,
          },
          userConfig,
        );

        const sync = translations.getSyncView();
        expect(sync.metadata).toMatchInlineSnapshot(`
          {
            "tags": [
              "shared tag 1",
              "shared tag 2",
            ],
          }
        `);

        expect(sync.entries['Good morning']).toMatchInlineSnapshot(`
          {
            "messages": {
              "en": {
                "message": "Good morning in French",
              },
              "fr": {
                "message": "Good morning in French",
              },
            },
            "tags": [
              "tag 2",
              "tag 3",
            ],
          }
        `);
        expect(sync.entries['Welcome']).toMatchInlineSnapshot(`
          {
            "messages": {
              "en": {
                "message": "Welcome",
              },
              "fr": {
                "message": "Welcome in French",
              },
            },
            "tags": [
              "tag 1",
              "tag 2",
            ],
          }
        `);
        expect(sync.entries['Hello'].messages.en).toMatchInlineSnapshot(`
          {
            "message": "Hello",
          }
        `);
      });
    });

    describe('when withTags is false', () => {
      it('should load translations without tags', () => {
        const translations = loadTranslation(
          {
            filePath: testTranslationsFilePath,
            fallbacks: 'all',
            withTags: false,
          },
          userConfig,
        );

        const sync = translations.getSyncView();
        expect(sync.metadata).toMatchInlineSnapshot(`
          {
            "tags": undefined,
          }
        `);

        expect(sync.entries['Hello'].messages.fr).toMatchInlineSnapshot(`
          {
            "message": "Hello in French",
          }
        `);
        const runtime = translations.getRuntimeView();
        expect(runtime.messagesByLanguage.fr).toMatchInlineSnapshot(`
          {
            "Good morning": "Good morning in French",
            "Goodbye": "Goodbye in French",
            "Hello": "Hello in French",
            "Welcome": "Welcome in French",
          }
        `);
        expect(runtime.messagesByLanguage.en).toMatchInlineSnapshot(`
          {
            "Good morning": "Good morning in French",
            "Goodbye": "Goodbye",
            "Hello": "Hello",
            "Welcome": "Welcome",
          }
        `);
      });
    });
  });
});

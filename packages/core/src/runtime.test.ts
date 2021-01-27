import { createTranslationFile, createLanguage } from './runtime';

const createDemoTranslationFile = () =>
  createTranslationFile<
    'en' | 'fr',
    {
      vocabPublishDate: {
        params: { publishDate: Date | number };
        returnType: string;
      };
    }
  >({
    en: createLanguage({
      vocabPublishDate: 'Vocab was published on {publishDate, date, small}',
    }),
    fr: createLanguage({
      vocabPublishDate: 'Vocab a été publié le {publishDate, date, medium}',
    }),
  });

describe('createTranslationFile', () => {
  it('should return TranslationModules with language as locale', () => {
    const translations = createDemoTranslationFile();
    const translationModule = translations.getMessages('en');
    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 11/20/2020');
  });

  // Support for alternative ICU locales in Node not available in current CI environment
  // Disabling test for now until `full-icu` can be added. See https://nodejs.org/api/intl.html#intl_options_for_building_node_js
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should return TranslationModules with en-AU locale', () => {
    const translations = createDemoTranslationFile();
    const translationModule = translations.getMessages('en', 'en-AU');
    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 20/11/2020');
  });
  it('should return TranslationModules with en-US locale', () => {
    const translations = createDemoTranslationFile();
    const translationModule = translations.getMessages('en', 'en-US');
    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 11/20/2020');
  });
  it('should require parameters to be passed in', () => {
    const translations = createDemoTranslationFile();
    const translationModule = translations.getMessages('en');
    expect(
      // @ts-expect-error Missing params parameter
      () => translationModule?.vocabPublishDate.format(),
    ).toThrowError(
      expect.objectContaining({
        message: expect.stringContaining('not provided'),
      }),
    );
    expect(() =>
      // @ts-expect-error Incorrect params parameter
      translationModule?.vocabPublishDate.format({ unrelated: 'message' }),
    ).toThrowError(
      expect.objectContaining({
        message: expect.stringContaining('not provided'),
      }),
    );
  });
});

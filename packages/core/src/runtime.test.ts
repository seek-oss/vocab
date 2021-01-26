import { createTranslationFile, createLanguage } from './runtime';

describe('createTranslationFile', () => {
  it('should return TranslationModules', () => {
    const translations = createTranslationFile<
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
    const translationModule = translations.getMessages('en', 'en-AU');
    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 20/11/2020');
  });
  it('should require parameters to be passed in', () => {
    const translations = createTranslationFile<
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
    const translationModule = translations.getMessages('en', 'en-AU');
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

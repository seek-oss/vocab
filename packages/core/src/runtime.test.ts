import type { FormatXMLElementFn } from 'intl-messageformat';
import { createTranslationFile, createLanguage } from './runtime';

const createDemoTranslationFile = () =>
  createTranslationFile<
    'en' | 'fr',
    {
      vocabPublishDate: <T = string>(values: {
        publishDate: Date | number;
      }) => string | T | Array<string | T>;
    }
  >({
    en: createLanguage({
      vocabPublishDate: 'Vocab was published on {publishDate, date, small}',
    }),
    fr: createLanguage({
      vocabPublishDate: 'Vocab a été publié le {publishDate, date, medium}',
    }),
  });

const createDemoTranslationFileWithTag = () =>
  createTranslationFile<
    'en' | 'fr',
    {
      vocabPublishDate: <T = string>(values: {
        link: FormatXMLElementFn<T>;
        strong: FormatXMLElementFn<T>;
      }) => string | T | Array<string | T>;
    }
  >({
    en: createLanguage({
      vocabPublishDate: '<link><strong>Vocab</strong> is awesome</link>!',
    }),
    fr: createLanguage({
      vocabPublishDate: '<link><strong>Vocab</strong> est génial</link>!',
    }),
  });

describe('createTranslationFile', () => {
  it('should return translations as a promise', async () => {
    const translations = createDemoTranslationFile();

    const translationModule = await translations.getMessages('en');

    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 11/20/2020');
  });

  it('should return TranslationModules with language as locale', () => {
    const translations = createDemoTranslationFile();

    const translationModule = translations.getLoadedMessages('en');

    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 11/20/2020');
  });

  it('should return TranslationModules with en-AU locale', () => {
    const translations = createDemoTranslationFile();

    const translationModule = translations.getLoadedMessages('en', 'en-AU');

    expect(
      translationModule?.vocabPublishDate.format({
        publishDate: 1605847714000,
      }),
    ).toBe('Vocab was published on 20/11/2020');
  });

  it('should return an array when tags return objects', () => {
    const translations = createDemoTranslationFileWithTag();
    const translationModule = translations.getLoadedMessages('en', 'en-US');
    if (!translationModule) {
      throw new Error('no translationModule');
    }

    interface TagResult {
      type: string;
      children: unknown;
    }
    type ExpectedResultType = string | TagResult | Array<string | TagResult>;

    const result = translationModule.vocabPublishDate.format<TagResult>({
      strong: (children) => ({
        type: 'strong',
        children,
      }),
      link: (children) => ({
        type: 'link',
        children,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unused: ExpectedResultType = result;
    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual([
      {
        children: [{ children: ['Vocab'], type: 'strong' }, ' is awesome'],
        type: 'link',
      },
      '!',
    ]);
  });

  it('should return a string when all tags return strings', () => {
    const translations = createDemoTranslationFileWithTag();
    const translationModule = translations.getLoadedMessages('en', 'en-US');
    if (!translationModule) {
      throw new Error('no translationModule');
    }

    type ExpectedResultType = string | string[];
    const result = translationModule.vocabPublishDate.format({
      strong: (children) => `*${children}*`,
      link: (children) => `[${children}]()`,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unused: ExpectedResultType = result;
    expect(typeof result).toBe('string');
    expect(result).toBe('[*Vocab* is awesome]()!');
  });

  it('should return TranslationModules with en-US locale', () => {
    const translations = createDemoTranslationFile();
    const translationModule = translations.getLoadedMessages('en', 'en-US');
    if (!translationModule) {
      throw new Error('no translationModule');
    }

    const result = translationModule.vocabPublishDate.format({
      publishDate: 1605847714000,
    });

    expect(result).toBe('Vocab was published on 11/20/2020');
  });

  it('should require parameters to be passed in', () => {
    const translations = createDemoTranslationFile();
    const translationModule = translations.getLoadedMessages('en');

    expect(() => {
      // @ts-expect-error Incorrect params parameter
      const result = translationModule?.vocabPublishDate.format({});
      return result;
    }).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('not provided'),
      }),
    );

    expect(() => {
      const result = translationModule?.vocabPublishDate.format({
        // @ts-expect-error Incorrect params parameter
        unrelated: 'message',
      });
      return result;
    }).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('not provided'),
      }),
    );
  });
});

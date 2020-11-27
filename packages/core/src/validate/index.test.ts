import { LoadedTranslation, LanguageName } from '@vocab/types';
import { findMissingKeys } from './index';

interface TestCase {
  loadedTranslation: LoadedTranslation;
  devLanguage: LanguageName;
  altLanguages: Array<LanguageName>;
  valid: boolean;
  missingKeys?: Record<LanguageName, Array<string>>;
}

const testCases: Array<TestCase> = [
  {
    loadedTranslation: {
      filePath: 'some-file.json',
      relativePath: 'some-file.json',
      languages: new Map([
        ['en', { key1: { message: 'Hi' } }],
        ['th', { key1: { message: 'Bye' } }],
      ]),
    },
    devLanguage: 'en',
    altLanguages: ['th'],
    valid: true,
  },
  {
    loadedTranslation: {
      filePath: 'some-file.json',
      relativePath: 'some-file.json',
      // @ts-expect-error
      languages: new Map([
        ['en', { key1: { message: 'Hi' } }],
        ['th', {}],
      ]),
    },
    devLanguage: 'en',
    altLanguages: ['th'],
    valid: false,
    missingKeys: {
      th: ['key1'],
    },
  },
];

test.each(testCases)(
  'validate',
  ({ loadedTranslation, devLanguage, altLanguages, valid, missingKeys }) => {
    const result = findMissingKeys(
      loadedTranslation,
      devLanguage,
      altLanguages,
    );

    expect(result[0]).toBe(valid);

    if (missingKeys) {
      expect(result[1]).toMatchObject(missingKeys);
    }
  },
);

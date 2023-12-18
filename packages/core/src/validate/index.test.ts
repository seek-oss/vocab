import type { LoadedTranslation, LanguageName } from '../types';
import { findMissingKeys } from './index';

interface TestCase {
  loadedTranslation: LoadedTranslation;
  devLanguage: LanguageName;
  altLanguages: LanguageName[];
  valid: boolean;
  missingKeys?: Record<LanguageName, string[]>;
}

const testCases: TestCase[] = [
  {
    loadedTranslation: {
      filePath: 'some-file.json',
      namespace: 'some-file',
      keys: ['key1', 'key2'],
      relativePath: 'some-file.json',
      languages: {
        en: {
          key1: { message: 'Hi', tags: ['greeting'] },
        },
        th: { key1: { message: 'Bye' } },
      },
      metadata: { tags: ['foo', 'bar'] },
    },
    devLanguage: 'en',
    altLanguages: ['th'],
    valid: true,
  },
  {
    loadedTranslation: {
      filePath: 'some-file.json',
      relativePath: 'some-file.json',
      namespace: 'some-file-2',
      keys: ['key1'],
      languages: {
        en: { key1: { message: 'Hi' } },
        th: {},
      },
      metadata: {},
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
      // eslint-disable-next-line jest/no-conditional-expect
      expect(result[1]).toMatchObject(missingKeys);
    }
  },
);

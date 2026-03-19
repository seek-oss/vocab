import type { LoadedTranslation, LanguageName } from '../types';
import { findMissingKeys } from './index';

interface TestCase {
  loadedTranslation: LoadedTranslation;
  devLanguage: LanguageName;
  altLanguages: LanguageName[];
  valid: boolean;
  missingKeys: Record<LanguageName, string[]>;
}

function mockLoadedTranslation(overrides: {
  filePath: string;
  namespace: string;
  keys: string[];
  relativePath: string;
  languages: Record<string, Record<string, { message: string; tags?: string[] }>>;
  metadata: { tags?: string[] };
}): LoadedTranslation {
  return {
    ...overrides,
    getRuntimeView() {
      const messagesByLanguage: Record<string, Record<string, string>> = {};
      for (const [lang, keys] of Object.entries(overrides.languages)) {
        messagesByLanguage[lang] = Object.fromEntries(
          Object.entries(keys).map(([k, v]) => [k, v.message]),
        );
      }
      return {
        filePath: overrides.filePath,
        keys: overrides.keys,
        namespace: overrides.namespace,
        relativePath: overrides.relativePath,
        messagesByLanguage,
      };
    },
    getSyncView() {
      const devLang = 'en';
      const devKeys = overrides.languages[devLang] ?? {};
      const entries: Record<string, { messages: Record<string, { message: string }> }> =
        {};
      for (const key of overrides.keys) {
        const messages: Record<string, { message: string }> = {};
        for (const [lang, langKeys] of Object.entries(overrides.languages)) {
          const data = langKeys[key];
          if (data) {
            messages[lang] = { message: data.message };
          }
        }
        entries[key] = { messages };
      }
      return {
        filePath: overrides.filePath,
        keys: overrides.keys,
        namespace: overrides.namespace,
        relativePath: overrides.relativePath,
        metadata: overrides.metadata,
        entries,
      };
    },
  };
}

const testCases: TestCase[] = [
  {
    loadedTranslation: mockLoadedTranslation({
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
    }),
    devLanguage: 'en',
    altLanguages: ['th'],
    valid: true,
    missingKeys: {},
  },
  {
    loadedTranslation: mockLoadedTranslation({
      filePath: 'some-file.json',
      relativePath: 'some-file.json',
      namespace: 'some-file-2',
      keys: ['key1'],
      languages: {
        en: { key1: { message: 'Hi' } },
        th: {},
      },
      metadata: {},
    }),
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

    expect(result[1]).toMatchObject(missingKeys);
  },
);

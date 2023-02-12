import { stringify } from 'csv-stringify/sync';
import type { TranslationsByLanguage } from '@vocab/types';
import assert from 'node:assert';

export function translationsToCsv(
  translations: TranslationsByLanguage,
  devLanguage: string,
) {
  const languages = Object.keys(translations);
  const altLanguages = languages.filter((language) => language !== devLanguage);
  // Ensure languages are ordered for locale mapping
  const orderedLanguages = [devLanguage, ...altLanguages];
  assert(
    languages.length === orderedLanguages.length,
    'Unexpected number of orderered languages',
  );

  const devLanguageTranslations = translations[devLanguage];

  const csv = Object.entries(devLanguageTranslations).map(
    ([key, { message, description, tags }]) => {
      const altTranslationMessages = altLanguages.map(
        (language) => translations[language]?.[key]?.message,
      );
      return [
        message,
        ...altTranslationMessages,
        key,
        description,
        tags?.join(','),
      ];
    },
  );

  const csvString = stringify(csv, {
    delimiter: ',',
    header: false,
  });

  // Column indices start at 1
  const localeMapping = Object.fromEntries(
    orderedLanguages.map((language, index) => [language, index + 1]),
  );
  const keyIndex = orderedLanguages.length + 1;
  const commentIndex = keyIndex + 1;
  const tagColumn = commentIndex + 1;

  return { csvString, localeMapping, keyIndex, commentIndex, tagColumn };
}

import { stringify } from 'csv-stringify/sync';
import type { TranslationsByLanguage } from '@vocab/types';

export function translationsToCsv(
  translations: TranslationsByLanguage,
  devLanguage: string,
) {
  const languages = Object.keys(translations);
  const altLanguages = languages.filter((language) => language !== devLanguage);

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

  // Not spreading `languages` to ensure correct ordering of dev language first
  // then alt languages
  const csvString = stringify(csv, {
    delimiter: ',',
    header: false,
  });

  // Column indices start at 1
  const localeMapping = Object.fromEntries(
    languages.map((language, index) => [language, index + 1]),
  );
  const keyIndex = languages.length + 1;
  const commentIndex = keyIndex + 1;
  const tagColumn = commentIndex + 1;

  return { csvString, localeMapping, keyIndex, commentIndex, tagColumn };
}

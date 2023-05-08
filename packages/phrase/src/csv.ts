import { stringify } from 'csv-stringify/sync';
import type { LanguageName, TranslationsByLanguage } from '@vocab/core';

type Value = string | undefined;
type CsvRow = Value[];
type CsvFile = CsvRow[];

export function translationsToCsv(
  translations: TranslationsByLanguage,
  devLanguage: string,
) {
  const languages = Object.keys(translations);
  const altLanguages = languages.filter((language) => language !== devLanguage);

  const devLanguageTranslations = translations[devLanguage];

  const csvFilesByLanguage: Record<LanguageName, CsvFile> = Object.fromEntries(
    languages.map((language) => [language, []]),
  );

  Object.entries(devLanguageTranslations).map(
    ([key, { message, description, tags }]) => {
      const sharedData = [key, description, tags?.join(',')];
      const devLanguageRow = [...sharedData, message];
      csvFilesByLanguage[devLanguage].push(devLanguageRow);

      altLanguages.map((language) => {
        const altTranslationMessage = translations[language]?.[key]?.message;

        if (altTranslationMessage) {
          csvFilesByLanguage[language].push([
            ...sharedData,
            altTranslationMessage,
          ]);
        }
      });
    },
  );

  const csvFileStrings = Object.fromEntries(
    Object.entries(csvFilesByLanguage)
      // Ensure CSV files are only created if the language has at least 1 translation
      .filter(([_, csvFile]) => csvFile.length > 0)
      .map(([language, csvFile]) => {
        const csvFileString = stringify(csvFile, {
          delimiter: ',',
          header: false,
        });

        return [language, csvFileString];
      }),
  );

  // Column indices start at 1
  const keyIndex = 1;
  const commentIndex = keyIndex + 1;
  const tagColumn = commentIndex + 1;
  const messageIndex = tagColumn + 1;

  return { csvFileStrings, keyIndex, messageIndex, commentIndex, tagColumn };
}

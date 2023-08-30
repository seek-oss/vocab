import { stringify } from 'csv-stringify/sync';
import type { ConsolidatedTranslation, LanguageName } from '@vocab/core';

type Value = string | undefined;
type CsvRow = Value[];
type CsvFile = CsvRow[];

export function translationsToCsv(
  translations: ConsolidatedTranslation[],
  allLanguages: string[],
) {
  const csvFileStrings: Record<LanguageName, string> = {};

  for (const language of allLanguages) {
    const rows: CsvFile = translations
      .filter(({ messageByLanguage }) => messageByLanguage[language])
      .map(({ globalKey, messageByLanguage, description, tags }) => [
        globalKey,
        description,
        tags?.join(','),
        messageByLanguage[language],
      ]);

    // Only push translations for a language if there is at-least one translation
    if (rows.length > 0) {
      csvFileStrings[language] = stringify(rows, {
        delimiter: ',',
        header: false,
      });
    }
  }

  // Column indices start at 1
  const keyIndex = 1;
  const commentIndex = keyIndex + 1;
  const tagColumn = commentIndex + 1;
  const messageIndex = tagColumn + 1;

  return { csvFileStrings, keyIndex, messageIndex, commentIndex, tagColumn };
}

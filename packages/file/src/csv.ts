import type { ConsolidatedTranslation } from '@vocab/core';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

const getColumns = ({
  devLanguage,
  altLanguages,
}: {
  devLanguage: string;
  altLanguages: string[];
}) => ['globalKey', 'key', 'description', 'tags', devLanguage, ...altLanguages];

const getAltLanguages = ({
  devLanguage,
  allLanguages,
}: {
  allLanguages: string[];
  devLanguage: string;
}) => allLanguages.filter((language) => language !== devLanguage);

export function csvToTranslations({ csvString }: { csvString: string }) {
  return parse(csvString, {
    columns: true,
  });
}

export function translationsToCsv({
  devLanguage,
  allLanguages,
  translations,
}: {
  devLanguage: string;
  allLanguages: string[];
  translations: ConsolidatedTranslation[];
}) {
  const altLanguages = getAltLanguages({ devLanguage, allLanguages });
  const rows = translations.map(({ messageByLanguage, tags, ...rest }) => ({
    ...rest,
    tags: tags?.join(', '),
    ...messageByLanguage,
  }));

  const csvFileString = stringify(rows, {
    columns: getColumns({ devLanguage, altLanguages }),
    delimiter: ',',
    header: true,
  });

  return { csvFileString };
}

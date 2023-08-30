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

const stripNullishValues = (obj: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );

const tagsDelimiter = ', ';

export function csvToTranslations({ csvString }: { csvString: string }) {
  const result = parse(csvString, {
    columns: true,
  }).map(
    ({
      globalKey,
      key,
      description,
      tags,
      ...messageByLanguage
    }: Record<string, string | undefined>): Omit<
      ConsolidatedTranslation,
      'namespace' | 'relativePath'
    > => {
      if (!globalKey) throw new Error('Invalid CSV Missing globalKey');
      if (!key) throw new Error('Invalid CSV Missing key');

      return {
        globalKey,
        key,
        description,
        tags: tags?.split(tagsDelimiter),
        messageByLanguage: stripNullishValues(messageByLanguage),
      };
    },
  );
  return result;
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
    tags: tags?.join(tagsDelimiter),
    ...messageByLanguage,
  }));

  const csvFileString = stringify(rows, {
    columns: getColumns({ devLanguage, altLanguages }),
    delimiter: ',',
    header: true,
  });

  return { csvFileString };
}

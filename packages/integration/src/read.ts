import {
  type UserConfig,
  loadAllTranslations,
  type LoadedTranslation,
  type ConsolidatedTranslation,
  getUniqueKey,
} from '@vocab/core';
import { trace } from './logger';

export async function loadConsolidatedTranslations(config: UserConfig) {
  const devLanguage = config.devLanguage;
  const allLanguages = config.languages.map((v) => v.name);

  const translationFiles = await loadAllTranslations(
    {
      fallbacks: 'none',
      includeNodeModules: false,
      withTags: true,
    },
    config,
  );
  return consolidateTranslations({
    translationFiles,
    devLanguage,
    allLanguages,
  });
}

/**
 * Consolidate all translations from separate files into a single de-normalised array.
 *
 * Useful when integrating translations with an external source.
 */
function consolidateTranslations({
  devLanguage,
  allLanguages,
  translationFiles,
}: {
  translationFiles: LoadedTranslation[];
  allLanguages: string[];
  devLanguage: string;
}): ConsolidatedTranslation[] {
  const translations = translationFiles.flatMap((loadedTranslation) =>
    loadedTranslation.keys.map((key) => {
      const row: ConsolidatedTranslation = {
        globalKey: getUniqueKey(key, loadedTranslation.namespace),
        key,
        description:
          loadedTranslation.languages[devLanguage]?.[key]?.description,
        tags: [
          ...(loadedTranslation.languages[devLanguage]?.[key]?.tags || []),
          ...(loadedTranslation.metadata.tags || []),
        ],
        namespace: loadedTranslation.namespace,
        relativePath: loadedTranslation.relativePath,
        messageByLanguage: {},
      };

      allLanguages.forEach((language) => {
        if (loadedTranslation.languages[language]?.[key]) {
          row.messageByLanguage[language] =
            loadedTranslation.languages[language][key].message;
        }
      });

      return row;
    }),
  );

  trace(
    `Consolidated ${translations.length} keys from ${translationFiles.length} files.`,
  );

  return translations;
}

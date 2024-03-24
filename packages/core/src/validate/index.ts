/* eslint-disable no-console */
import type { UserConfig, LoadedTranslation, LanguageName } from '../types';
import pc from 'picocolors';

import { loadAllTranslations } from '../load-translations';
import { getAltLanguages } from '../utils';

export function findMissingKeys(
  loadedTranslation: LoadedTranslation,
  devLanguageName: LanguageName,
  altLanguages: LanguageName[],
) {
  const devLanguage = loadedTranslation.languages[devLanguageName];

  if (!devLanguage) {
    throw new Error(
      `Failed to load dev language: ${loadedTranslation.filePath}`,
    );
  }

  const result: Record<LanguageName, string[]> = {};
  let valid = true;

  const requiredKeys = Object.keys(devLanguage);

  if (requiredKeys.length > 0) {
    for (const altLanguageName of altLanguages) {
      const altLanguage = loadedTranslation.languages[altLanguageName] ?? {};

      for (const key of requiredKeys) {
        if (typeof altLanguage[key]?.message !== 'string') {
          if (!result[altLanguageName]) {
            result[altLanguageName] = [];
          }

          result[altLanguageName].push(key);
          valid = false;
        }
      }
    }
  }
  return [valid, result] as const;
}

export async function validate(config: UserConfig) {
  const allTranslations = await loadAllTranslations(
    { fallbacks: 'valid', includeNodeModules: true },
    config,
  );

  let valid = true;

  for (const loadedTranslation of allTranslations) {
    const [translationValid, result] = findMissingKeys(
      loadedTranslation,
      config.devLanguage,
      getAltLanguages(config),
    );

    if (!translationValid) {
      valid = false;
      console.log(
        pc.red(
          `Incomplete translations: "${pc.bold(
            loadedTranslation.relativePath,
          )}"`,
        ),
      );

      for (const lang of Object.keys(result)) {
        const missingKeys = result[lang];

        console.log(
          pc.yellow(lang),
          '->',
          missingKeys.map((v) => `"${v}"`).join(', '),
        );
      }
    }
  }

  return valid;
}

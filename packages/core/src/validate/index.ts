/* eslint-disable no-console */
import { UserConfig, LoadedTranslation, LanguageName } from '../types';
import chalk from 'chalk';

import { loadAllTranslations } from '../load-translations';
import { getAltLanguages } from '../utils';

export function findMissingKeys(
  loadedTranslation: LoadedTranslation,
  devLanguageName: LanguageName,
  altLanguages: Array<LanguageName>,
) {
  const devLanguage = loadedTranslation.languages[devLanguageName];

  if (!devLanguage) {
    throw new Error(
      `Failed to load dev language: ${loadedTranslation.filePath}`,
    );
  }

  const result: Record<LanguageName, Array<string>> = {};
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
        chalk.red`Incomplete translations: "${chalk.bold(
          loadedTranslation.relativePath,
        )}"`,
      );

      for (const lang of Object.keys(result)) {
        const missingKeys = result[lang];

        console.log(
          chalk.yellow(lang),
          '->',
          missingKeys.map((v) => `"${v}"`).join(', '),
        );
      }
    }
  }

  return valid;
}

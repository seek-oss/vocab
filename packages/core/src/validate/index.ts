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

export interface ValidationError {
  key: string;
  namespace: string;
  language: string;
  reason: 'not-validated' | 'missing-validated-field';
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  totalKeys: number;
  validatedKeys: number;
  skippedKeys: number;
}

export async function validateTranslationStatus(
  config: UserConfig,
): Promise<ValidationResult> {
  const allTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: false },
    config,
  );

  const errors: ValidationError[] = [];
  let totalKeys = 0;
  let validatedKeys = 0;
  let skippedKeys = 0;

  for (const loadedTranslation of allTranslations) {
    const devLanguageTranslations =
      loadedTranslation.languages[config.devLanguage];

    for (const language of config.languages) {
      const languageTranslations = loadedTranslation.languages[language.name];

      if (!languageTranslations) {
        continue;
      }

      for (const [key, translationData] of Object.entries(
        languageTranslations,
      )) {
        totalKeys++;

        // Check skipValidation in the dev language first, then in current language
        const devTranslationData = devLanguageTranslations?.[key];
        const shouldSkipValidation =
          translationData.skipValidation || devTranslationData?.skipValidation;

        if (shouldSkipValidation) {
          skippedKeys++;
          continue;
        }

        // Check if validated field exists
        if (translationData.validated === undefined) {
          errors.push({
            key,
            namespace: loadedTranslation.namespace,
            language: language.name,
            reason: 'missing-validated-field',
          });
          continue;
        }

        // Check if translation is validated
        if (!translationData.validated) {
          errors.push({
            key,
            namespace: loadedTranslation.namespace,
            language: language.name,
            reason: 'not-validated',
          });
          continue;
        }

        validatedKeys++;
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    totalKeys,
    validatedKeys,
    skippedKeys,
  };
}

export function formatValidationResults(result: ValidationResult): string {
  const { success, errors, totalKeys, validatedKeys, skippedKeys } = result;

  if (success) {
    return (
      `${pc.green(
        `✓ All translations are validated!\n`,
      )}  Total keys: ${totalKeys}\n` +
      `  Validated: ${validatedKeys}\n` +
      `  Skipped: ${skippedKeys}`
    );
  }

  const errorsByType = errors.reduce(
    (acc, error) => {
      if (!acc[error.reason]) {
        acc[error.reason] = [];
      }
      acc[error.reason].push(error);
      return acc;
    },
    {} as Record<string, ValidationError[]>,
  );

  let output = pc.red(`✗ Translation validation failed!\n`);
  output += `  Total keys: ${totalKeys}\n`;
  output += `  Validated: ${validatedKeys}\n`;
  output += `  Skipped: ${skippedKeys}\n`;
  output += `  Errors: ${errors.length}\n\n`;

  if (errorsByType['missing-validated-field']) {
    output += pc.yellow(
      `Missing validated field (${errorsByType['missing-validated-field'].length} keys):\n`,
    );
    for (const error of errorsByType['missing-validated-field']) {
      output += `  • ${error.namespace}.${error.key} (${error.language})\n`;
    }
    output += '\n';
  }

  if (errorsByType['not-validated']) {
    output += pc.red(
      `Not validated (${errorsByType['not-validated'].length} keys):\n`,
    );
    for (const error of errorsByType['not-validated']) {
      output += `  • ${error.namespace}.${error.key} (${error.language})\n`;
    }
    output += '\n';
  }

  output += pc.cyan(
    'Tip: Add "skipValidation": true to keys that don\'t need validation.',
  );

  return output;
}

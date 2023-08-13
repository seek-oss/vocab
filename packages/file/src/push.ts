import fs from 'fs/promises';
import { loadConsolidatedTranslations, type UserConfig } from '@vocab/core';
import { translationsToCsv } from './csv';
import { log, trace } from './logger';

import { getFormatFromPath } from './utils';

interface PushOptions {
  file?: string;
  includeHeaders?: boolean;
}

export async function push(options: PushOptions, config: UserConfig) {
  const devLanguage = config.devLanguage;
  const allLanguages = config.languages.map((v) => v.name);

  trace('Loading translations...');

  const translations = await loadConsolidatedTranslations(
    {
      fallbacks: 'none',
      includeNodeModules: false,
      withTags: true,
      devLanguage,
      allLanguages,
    },
    config,
  );

  const resolvedFormat = getFormatFromPath(options.file);
  const filePath = options.file || `translations.${resolvedFormat}`;

  log(
    `Writing ${
      translations.length
    } keys to ${resolvedFormat.toLocaleUpperCase()} file. ${filePath}`,
  );

  if (resolvedFormat === 'json') {
    await fs.writeFile(filePath, JSON.stringify(translations, null, 2));
  }
  if (resolvedFormat === 'csv') {
    const { csvFileString } = translationsToCsv({
      devLanguage,
      allLanguages,
      translations,
    });

    await fs.writeFile(filePath, csvFileString);
  }
}

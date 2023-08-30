import fs from 'fs/promises';
import type { UserConfig } from '@vocab/core';
import { loadConsolidatedTranslations } from '@vocab/integration';
import { translationsToCsv } from './csv';
import { log, trace } from './logger';

import { getFileFromOptions } from './utils';

export interface PushOptions {
  file?: string;
  includeHeaders?: boolean;
}

export async function push(options: PushOptions, config: UserConfig) {
  const devLanguage = config.devLanguage;
  const allLanguages = config.languages.map((v) => v.name);

  trace('Loading translations...');

  const translations = await loadConsolidatedTranslations(config);

  const { filePath, fileFormat } = getFileFromOptions(options);

  log(
    `Writing ${
      translations.length
    } keys to ${fileFormat.toLocaleUpperCase()} file. ${filePath}`,
  );

  if (fileFormat === 'json') {
    await fs.writeFile(filePath, JSON.stringify(translations, null, 2));
  }
  if (fileFormat === 'csv') {
    const { csvFileString } = translationsToCsv({
      devLanguage,
      allLanguages,
      translations,
    });

    await fs.writeFile(filePath, csvFileString);
  }
}

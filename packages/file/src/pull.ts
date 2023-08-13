import {
  loadAllTranslations,
  getAltLanguages,
  type ConsolidatedTranslation,
  type UserConfig,
} from '@vocab/core';
import { readFile } from 'fs/promises';
import { csvToTranslations } from './csv';

import { getFormatFromPath, mergeInExternalTranslations } from './utils';

interface PullOptions {
  file?: string;
}

export async function pull(options: PullOptions, config: UserConfig) {
  const resolvedFormat = getFormatFromPath(options.file);
  const filePath = options.file || `translations.${resolvedFormat}`;

  const format = getFormatFromPath(filePath);

  const contents = await readFile(filePath, 'utf-8');

  const externalTranslations: ConsolidatedTranslation[] =
    format === 'json'
      ? JSON.parse(contents)
      : csvToTranslations({ csvString: contents });

  const devLanguage = config.devLanguage;
  const alternativeLanguages = getAltLanguages(config);

  const existingTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
    config,
  );

  await mergeInExternalTranslations(
    existingTranslations,
    externalTranslations,
    devLanguage,
    alternativeLanguages,
  );
}

import type { ConsolidatedTranslation, UserConfig } from '@vocab/core';
import {
  applyExternalTranslations,
  type MessagesByLanguageByKey,
} from '@vocab/integration';
import { readFile } from 'fs/promises';
import { csvToTranslations } from './csv';

import { getFileFromOptions } from './utils';

export interface PullOptions {
  file?: string;
  check?: boolean;
}
/**
 * Pulls translations from the external file, compares against existing translations, identifying differences and updates messages where appropriate
 */
export async function pull(options: PullOptions, config: UserConfig) {
  const { filePath, fileFormat } = getFileFromOptions(options);

  const contents = await readFile(filePath, 'utf-8');

  const externalTranslations: ConsolidatedTranslation[] =
    fileFormat === 'json'
      ? JSON.parse(contents)
      : csvToTranslations({ csvString: contents });

  const record: MessagesByLanguageByKey = Object.fromEntries(
    externalTranslations.map((t) => [t.globalKey, t.messageByLanguage]),
  );

  applyExternalTranslations(record, options, config);
}

import path from 'path';

import type { UserConfig, LoadedTranslation } from '../types';

import { trace } from '../logger';
import type { Fallback } from '../utils';
import { validateTranslationFile } from '../translation-file-schema';
import { loadTranslationsFromUnifiedFormat } from './load-unified-translations';

export function loadTranslation(
  {
    filePath,
    fallbacks,
    withTags,
  }: {
    filePath: string;
    fallbacks: Fallback;
    withTags?: boolean;
  },
  userConfig: UserConfig,
): LoadedTranslation {
  trace(
    `Loading translation file in "${fallbacks}" fallback mode: "${filePath}"`,
  );

  delete require.cache[filePath];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const translationContent = require(filePath);
  const relativePath = path.relative(
    userConfig.projectRoot || process.cwd(),
    filePath,
  );

  const parsed = validateTranslationFile(translationContent);

  return loadTranslationsFromUnifiedFormat({
    filePath,
    relativePath,
    withTags,
    fallbacks,
    content: parsed,
    userConfig,
  });
}

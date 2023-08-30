import type { UserConfig } from '@vocab/core';

import {
  ensureBranch,
  deleteUnusedKeys as phraseDeleteUnusedKeys,
  pushTranslations,
} from './phrase-api';
import { trace } from './logger';
import { loadConsolidatedTranslations } from '@vocab/integration';

interface PushOptions {
  branch: string;
  deleteUnusedKeys?: boolean;
}

/**
 * Uploads translations to the Phrase API for each language.
 * A unique namespace is appended to each key using the file path the key came from.
 */
export async function push(
  { branch, deleteUnusedKeys }: PushOptions,
  config: UserConfig,
) {
  trace(`Pushing translations to branch ${branch}`);
  const devLanguage = config.devLanguage;
  const allLanguages = config.languages.map((v) => v.name);
  await ensureBranch(branch);

  trace(
    `Pushing translations to phrase for languages ${allLanguages.join(', ')}`,
  );

  const consolidatedTranslations = await loadConsolidatedTranslations(config);

  const { devLanguageUploadId } = await pushTranslations(
    consolidatedTranslations,
    {
      devLanguage,
      allLanguages,
      branch,
    },
  );

  if (deleteUnusedKeys) {
    await phraseDeleteUnusedKeys(devLanguageUploadId, branch);
  }
}

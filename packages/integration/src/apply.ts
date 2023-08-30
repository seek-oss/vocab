import {
  loadAllTranslations,
  getAltLanguages,
  type UserConfig,
} from '@vocab/core';
import chalk from 'chalk';
import { log } from 'debug';
import { getAllChanges, type MessageChange } from './apply/get-changes';
import type { MessagesByLanguageByKey } from './apply/types';
import { updateAllTranslations } from './apply/update-translations';

interface ApplyOptions {
  check?: boolean;
}

const stringifyChanges = ([fileName, changes]: [
  fileName: string,
  changes: MessageChange[],
]) =>
  `${chalk.green(fileName)}\n${changes
    .map((c) => `${c.key}: "${c.oldValue}" => "${c.newValue}"`)
    .join('\n')}`;

export async function applyExternalTranslations(
  externalTranslations: MessagesByLanguageByKey,
  options: ApplyOptions,
  config: UserConfig,
) {
  const devLanguage = config.devLanguage;
  const altLanguages = getAltLanguages(config);

  const existingTranslations = await loadAllTranslations(
    { fallbacks: 'none', includeNodeModules: false, withTags: true },
    config,
  );

  const changesByFile = await getAllChanges(
    existingTranslations,
    externalTranslations,
    devLanguage,
    altLanguages,
  );

  if (Object.keys(changesByFile).length === 0) {
    log('No Changes Found');
  } else if (options.check) {
    log(
      `Changes Found\n${Object.entries(changesByFile)
        .map(stringifyChanges)
        .join('\n\n')}`,
    );
    throw new Error('Changes Found');
  } else {
    await updateAllTranslations(changesByFile);
  }
}

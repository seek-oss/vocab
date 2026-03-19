import { glob } from 'tinyglobby';
import type { UserConfig, LoadedTranslation } from '../types';

import { trace } from '../logger';
import { type Fallback, getDevTranslationFileGlob } from '../utils';
import { loadTranslation } from './load-translations';
import { getUniqueKey } from './common';

export async function loadAllTranslations(
  {
    fallbacks,
    includeNodeModules,
    withTags,
  }: { fallbacks: Fallback; includeNodeModules: boolean; withTags?: boolean },
  config: UserConfig,
): Promise<LoadedTranslation[]> {
  const { projectRoot, ignore = [] } = config;

  const translationFiles = await glob(getDevTranslationFileGlob(config), {
    ignore: includeNodeModules ? ignore : [...ignore, '**/node_modules/**'],
    dot: true,
    absolute: true,
    cwd: projectRoot,
    expandDirectories: false,
  });

  trace(`Found ${translationFiles.length} translation files`);

  const loadedTranslations: LoadedTranslation[] = [];
  const keys = new Set<string>();

  for (const translationFile of translationFiles) {
    const loadedTranslation = loadTranslation(
      { filePath: translationFile, fallbacks, withTags },
      config,
    );

    loadedTranslations.push(loadedTranslation);

    const syncView = loadedTranslation.getSyncView();
    for (const key of loadedTranslation.keys) {
      const uniqueKey = getUniqueKey(key, loadedTranslation.namespace);
      if (keys.has(uniqueKey)) {
        trace(`Duplicate keys found`);
        throw new Error(
          `Duplicate keys found. Key with namespace ${loadedTranslation.namespace} and key ${key} was found multiple times.`,
        );
      }
      keys.add(uniqueKey);

      const globalKey = syncView.entries[key]?.globalKey;
      if (globalKey) {
        if (keys.has(globalKey)) {
          throw new Error(
            `Duplicate keys found. Key with global key ${globalKey} and key ${key} was found multiple times`,
          );
        }
        keys.add(globalKey);
      }
    }
  }

  return loadedTranslations;
}

import { compiledVocabFileFilter as _compiledVocabFileFilter } from '@vocab/core';
import { getChunkName, getLanguageFromChunkName } from './get-chunk-name';

/**
 * @deprecated Import from `@vocab/core` instead
 */
export const compiledVocabFileFilter = _compiledVocabFileFilter;
export const virtualModuleId = 'virtual:vocab';

export const getPreloadModuleId = (lang: string) =>
  `/@vocab/preload/${getChunkName(lang)}.js`;

export const getPreloadLanguage = (id: string) => {
  const chunkName = /\/@vocab\/preload\/([^/?]+)\.js/.exec(id)?.[1];
  return getLanguageFromChunkName(chunkName);
};

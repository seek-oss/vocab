import { compiledVocabFileFilter as _compiledVocabFileFilter } from '@vocab/core';

/**
 * @deprecated Import from `@vocab/core` instead
 */
export const compiledVocabFileFilter = _compiledVocabFileFilter;
export const virtualModuleId = 'virtual:vocab';
export const sourceQueryKey = '?source=';

export const getPreloadModuleId = (lang: string) =>
  `${virtualModuleId}-preload-${lang}`;

export const getPreloadLanguage = (id: string) =>
  /virtual:vocab-preload-([\w-]+)/.exec(id)?.[1];

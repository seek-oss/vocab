const translationsChunkSuffix = '-translations';

export function getChunkName(lang: string) {
  return `${lang}${translationsChunkSuffix}`;
}

export function isVocabChunkName(name?: string) {
  return Boolean(name?.endsWith(translationsChunkSuffix));
}

const translationsChunkSuffix = '-translations';

export function getChunkName(lang: string) {
  return `${lang}${translationsChunkSuffix}`;
}

export function getLanguageFromChunkName(name?: string) {
  if (!name?.endsWith(translationsChunkSuffix)) {
    return;
  }

  return name.slice(0, -translationsChunkSuffix.length) || undefined;
}

export function isVocabChunkName(name?: string) {
  return Boolean(getLanguageFromChunkName(name));
}

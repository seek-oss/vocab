import type { LanguageTarget, LanguageName } from '../types';
import type { Fallback } from '../utils';

function getLanguageFallbacks({ languages }: { languages: LanguageTarget[] }) {
  const languageFallbackMap = new Map<LanguageName, LanguageName>();

  for (const lang of languages) {
    if (lang.extends) {
      languageFallbackMap.set(lang.name, lang.extends);
    }
  }

  return languageFallbackMap;
}

export function getLanguageHierarchy({
  languages,
}: {
  languages: LanguageTarget[];
}) {
  const hierarchyMap = new Map<LanguageName, LanguageName[]>();
  const fallbacks = getLanguageFallbacks({ languages });

  for (const lang of languages) {
    const langHierarchy = [];
    let currLang = lang.extends;

    while (currLang) {
      langHierarchy.push(currLang);

      currLang = fallbacks.get(currLang);
    }

    hierarchyMap.set(lang.name, langHierarchy);
  }

  return hierarchyMap;
}

export function getFallbackLanguageOrder({
  languages,
  languageName,
  devLanguage,
  fallbacks,
}: {
  languages: LanguageTarget[];
  languageName: string;
  devLanguage: string;
  fallbacks: Fallback;
}) {
  const languageHierarchy = getLanguageHierarchy({ languages }).get(
    languageName,
  );

  if (!languageHierarchy) {
    throw new Error(`Missing language hierarchy for ${languageName}`);
  }

  const fallbackLanguageOrder: string[] = [languageName];

  if (fallbacks !== 'none') {
    fallbackLanguageOrder.unshift(...languageHierarchy.reverse());

    if (fallbacks === 'all' && fallbackLanguageOrder[0] !== devLanguage) {
      fallbackLanguageOrder.unshift(devLanguage);
    }
  }

  return fallbackLanguageOrder;
}

import { callPhrase } from './call-phrase';

type Translation = {
  content: string;
  validated: boolean;
};

type KeyData = {
  phraseKeyId: string;
  translations: Record<string, Translation>;
  description?: string;
  tags: string[];
};

export type KeysByName = Record<string, KeyData>;

type TranslationInPhrase = {
  phraseTranslationId: string;
  phraseLocaleId: string;
  content: string;
  validated: boolean;
};

export type KeysByNameWithPhraseMetadata = Record<
  string,
  {
    phraseKeyId: string;
    translations: Record<string, TranslationInPhrase>;
    description?: string;
    tags: string[];
  }
>;

export async function pullAllTranslations(
  branch: string,
): Promise<KeysByNameWithPhraseMetadata> {
  const phraseKeysResult = await callPhrase<
    Array<{
      id: string;
      name: string;
      description: string;
      tags: string[];
    }>
  >(`keys?branch=${branch}&per_page=100`);

  const phraseTranslationsResult = await callPhrase<
    Array<{
      key: { id: string; name: string };
      locale: { id: string; name: string };
      content: string;
      validated: boolean;
    }>
  >(`translations?branch=${branch}&per_page=100`);

  const translations: KeysByNameWithPhraseMetadata = {};

  for (const r of phraseKeysResult) {
    translations[r.name] = {
      phraseKeyId: r.id,
      translations: {},
      description: r.description || undefined,
      tags: r.tags,
    };
  }

  for (const r of phraseTranslationsResult) {
    if (!translations[r.key.name]) {
      translations[r.key.name] = {
        phraseKeyId: r.key.id,
        translations: {},
        tags: [],
      };
    }

    translations[r.key.name].translations[r.locale.name] = {
      phraseTranslationId: r.key.id,
      phraseLocaleId: r.locale.id,
      content: r.content,
      validated: r.validated,
    };
  }

  return translations;
}

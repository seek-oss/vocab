import type { IntlMessageFormat } from 'intl-messageformat';

export type ParsedICUMessages<TranslatedLanguage> = Record<
  keyof TranslatedLanguage,
  IntlMessageFormat
>;

export type TranslationModule<TranslatedLanguage> = {
  getValue: () => ParsedICUMessages<TranslatedLanguage> | undefined;
  load: () => Promise<void>;
};

export type TranslationFile<TranslatedLanguage> = {
  __DO_NOT_USE__: Record<string, TranslationModule<TranslatedLanguage>>;
};

export interface RawJsonTranslations {
  [translationKey: string]: {
    message: string;
  };
}

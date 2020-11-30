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
  [translationKey: string]: string;
}

export interface LanguageTarget {
  // The name or tag of a language
  name: string;
  // Translations will be copied from parent language when they don't exist in child. Defaults to first language.
  extends?: string;
}

export interface UserConfig {
  projectRoot?: string;
  /**
   * The language used in translations.json
   */
  devLanguage: string;
  /**
   * An array of languages to build for
   */
  languages: Array<LanguageTarget>;
  translationsDirname?: string;
}

export type LanguageName = string;

export type TranslationsByLanguage<Key extends string = string> = Record<
  Key,
  {
    message: string;
    description?: string;
  }
>;

export type LoadedTranslation<Key extends string = string> = {
  namespace: string;
  keys: Array<Key>;
  filePath: string;
  relativePath: string;
  languages: Map<LanguageName, TranslationsByLanguage<Key>>;
};

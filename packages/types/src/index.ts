import type { IntlMessageFormat } from 'intl-messageformat';

export type LanguageName = string;

export type TranslationKey = string;
export type TranslationMessage = string;

export type ParsedICUMessages<TranslatedLanguage> = Record<
  keyof TranslatedLanguage,
  IntlMessageFormat
>;

export type TranslationModule<TranslatedLanguage> = {
  getValue: (
    locale: string,
  ) => ParsedICUMessages<TranslatedLanguage> | undefined;
  load: () => Promise<void>;
};

export type TranslationFile<TranslatedLanguage> = Record<
  LanguageName,
  TranslationModule<TranslatedLanguage>
>;

export interface LanguageTarget {
  // The name or tag of a language
  name: LanguageName;
  // Translations will be copied from parent language when they don't exist in child. Defaults to first language.
  extends?: LanguageName;
}

export interface UserConfig {
  /**
   * The root directory to compile and validate translations
   */
  projectRoot?: string;
  /**
   * The language used in translations.json
   */
  devLanguage: LanguageName;
  /**
   * An array of languages to build for
   */
  languages: Array<LanguageTarget>;
  /**
   * A custom suffix to name vocab translation directories
   */
  translationsDirectorySuffix?: string;
  /**
   * An array of glob paths to ignore from compilation and validation
   */
  ignore?: Array<string>;
}
export interface TranslationData {
  message: TranslationMessage;
  description?: string;
}
export type TranslationsByKey<Key extends TranslationKey = string> = Record<
  Key,
  TranslationData
>;
export type TranslationMessagesByKey<
  Key extends TranslationKey = string
> = Record<Key, TranslationMessage>;

export type TranslationsByLanguage<
  Key extends TranslationKey = string
> = Record<LanguageName, TranslationsByKey<Key>>;

export type LoadedTranslation<Key extends TranslationKey = string> = {
  namespace: string;
  keys: Array<Key>;
  filePath: string;
  relativePath: string;
  languages: TranslationsByLanguage<Key>;
};

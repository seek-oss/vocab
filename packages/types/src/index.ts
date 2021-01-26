import { ReactNode } from 'react';

export type LanguageName = string;

export type TranslationKey = string;
export type TranslationMessage = string;

interface TranslationRequirements {
  params?: Record<string, any>;
  returnType: string | ReactNode;
}
export type TranslationRequirementsByKey = Record<
  string,
  TranslationRequirements
>;

/**
 * StrictParsedICUMessage A limited strictly typed format from intl-messageformat
 */
export interface StrictParsedICUMessage<
  Requirements extends TranslationRequirements
> {
  format: Requirements['params'] extends Record<string, any>
    ? (params: Requirements['params']) => Requirements['returnType']
    : () => Requirements['returnType'];
}

export type ParsedICUMessages<
  RequirementsByKey extends TranslationRequirementsByKey
> = {
  [key in keyof RequirementsByKey]: StrictParsedICUMessage<
    RequirementsByKey[key]
  >;
};

/**
 * TranslationModule is a wrapper around a potentially asyncronously loaded set of ParsedICUMessages
 */
export type TranslationModule<
  RequirementsByKey extends TranslationRequirementsByKey
> = {
  getValue: (
    locale: string,
  ) => ParsedICUMessages<RequirementsByKey> | undefined;
  load: () => Promise<void>;
};

export type TranslationModuleByLanguage<
  Language extends LanguageName,
  RequirementsByKey extends TranslationRequirementsByKey
> = Record<Language, TranslationModule<RequirementsByKey>>;

export type TranslationFile<
  Language extends LanguageName,
  RequirementsByKey extends TranslationRequirementsByKey
> = {
  getMessages: (
    language: Language,
    locale?: string,
  ) => ParsedICUMessages<RequirementsByKey> | null;
  load: (language: Language) => Promise<void>;
};

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

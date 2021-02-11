export type LanguageName = string;

export type TranslationKey = string;
export type TranslationMessage = string;

type AnyFunction = (...args: any) => any;

interface TranslationRequirements {
  format: AnyFunction;
}
export type TranslationRequirementsByKey = Record<
  string,
  TranslationRequirements
>;

export type ICUFormatResult<T = unknown> = string | T | (string | T);

/**
 * ParsedICUMessage A strictly typed formatter from intl-messageformat
 */
interface ParsedICUMessage<Requirements extends TranslationRequirements> {
  format: Requirements['format'];
}

export type ParsedICUMessages<
  RequirementsByKey extends TranslationRequirementsByKey
> = {
  [key in keyof RequirementsByKey]: ParsedICUMessage<RequirementsByKey[key]>;
};

/**
 * TranslationModule is a wrapper around a potentially asynchronously loaded set of ParsedICUMessages
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

/**
 * TranslationFile contains a record of TranslationModules per language, exposing a set of methods to load and return the module by language
 */
export type TranslationFile<
  Language extends LanguageName,
  RequirementsByKey extends TranslationRequirementsByKey
> = {
  /**
   *  Retrieve messages. If not loaded, will attempt to load messages and resolve once complete.
   */
  getMessages: (
    language: Language,
    locale?: string,
  ) => Promise<ParsedICUMessages<RequirementsByKey>>;
  /**
   *  Retrieve already loaded messages. Will return null if no messages have not been loaded.
   */
  getLoadedMessages: (
    language: Language,
    locale?: string,
  ) => ParsedICUMessages<RequirementsByKey> | null;
  /**
   *  Load messages for the given language. Resolving once complete.
   */
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

export { FormatXMLElementFn } from 'intl-messageformat';

export type LanguageName = string;

export type TranslationKey = string;
export type TranslationMessage = string;

export type ParsedFormatFn = (parts: any) => any;
export type ParsedFormatFnByKey = Record<string, ParsedFormatFn>;

export type ICUFormatResult<T = unknown> = string | T | (string | T);

/**
 * ParsedICUMessage A strictly typed formatter from intl-messageformat
 */
interface ParsedICUMessage<FormatFn extends ParsedFormatFn> {
  format: FormatFn;
}

export type ParsedICUMessages<FormatFnByKey extends ParsedFormatFnByKey> = {
  [key in keyof FormatFnByKey]: ParsedICUMessage<FormatFnByKey[key]>;
};

/**
 * TranslationModule is a wrapper around a potentially asynchronously loaded set of ParsedICUMessages
 */
export type TranslationModule<FormatFnByKey extends ParsedFormatFnByKey> = {
  getValue: (locale: string) => ParsedICUMessages<FormatFnByKey> | undefined;
  load: () => Promise<void>;
};

export type TranslationModuleByLanguage<
  Language extends LanguageName,
  FormatFnByKey extends ParsedFormatFnByKey,
> = Record<Language, TranslationModule<FormatFnByKey>>;

/**
 * TranslationFile contains a record of TranslationModules per language, exposing a set of methods to load and return the module by language
 */
export type TranslationFile<
  Language extends LanguageName,
  FormatFnByKey extends ParsedFormatFnByKey,
> = {
  /**
   *  Retrieve messages. If not loaded, will attempt to load messages and resolve once complete.
   */
  getMessages: (
    language: Language,
    locale?: string,
  ) => Promise<ParsedICUMessages<FormatFnByKey>>;
  /**
   *  Retrieve already loaded messages. Will return null if no messages have been loaded.
   */
  getLoadedMessages: (
    language: Language,
    locale?: string,
  ) => ParsedICUMessages<FormatFnByKey> | null;
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

export type MessageGenerator = (message: string) => string;

export interface GeneratedLanguageTarget {
  // The name or tag of a generated language
  name: LanguageName;
  // Language to generate translations from. Defaults to the dev language.
  extends?: LanguageName;
  // Function used to generate translations
  generator: MessageGenerator;
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
   * An array of languages to generate from existing translations
   */
  generatedLanguages?: Array<GeneratedLanguageTarget>;
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
export type TranslationMessagesByKey<Key extends TranslationKey = string> =
  Record<Key, TranslationMessage>;

export type TranslationsByLanguage<Key extends TranslationKey = string> =
  Record<LanguageName, TranslationsByKey<Key>>;

export type LoadedTranslation<Key extends TranslationKey = string> = {
  namespace: string;
  keys: Array<Key>;
  filePath: string;
  relativePath: string;
  languages: TranslationsByLanguage<Key>;
};

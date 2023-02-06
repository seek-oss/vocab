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

export interface MessageGenerator {
  transformElement?: (element: string) => string;
  transformMessage?: (message: string) => string;
}

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

// TODO: Is this the correct type for tags? Do we do key:value, or comma separated string?
// Of note is the fact that phrase doesn't like colon characters in tag names, so the natural
// representation of a key value tag isn't valid, it gets normalized to `key_value`
export type Tags = Array<string>;

export interface TranslationFileMetadata {
  tags?: Tags;
}

export interface TranslationData {
  message: TranslationMessage;
  description?: string;
  tags?: Tags;
}

export type TranslationsByKey<Key extends TranslationKey = string> = Record<
  Key,
  TranslationData
>;

// TODO: Do we expose this const from the types package? It would be useful IMO, would avoid hardcoding
// `_meta` in code
const translationFileMatadataField = '_meta';

export type TranslationFileContents = TranslationsByKey &
  Partial<Record<typeof translationFileMatadataField, TranslationFileMetadata>>;

export type TranslationMessagesByKey<Key extends TranslationKey = string> =
  Record<Key, TranslationMessage>;

// TODO: This could be generic over the tags type
// TODO: Phrase integration is the only place that uses this type
export type TranslationsByLanguage<Key extends TranslationKey = string> =
  Record<LanguageName, TranslationsByKey<Key>>;

export type LoadedTranslation<Key extends TranslationKey = string> = {
  namespace: string;
  keys: Array<Key>;
  filePath: string;
  relativePath: string;
  languages: TranslationsByLanguage<Key>;
  metadata: TranslationFileMetadata;
};

export type { FormatXMLElementFn } from 'intl-messageformat';

export type LanguageName = string;

export type TranslationKey = string;
export type TranslationMessage = string;

export type ParsedFormatFn = (parts: any) => any;
export type ParsedFormatFnByKey = Record<string, ParsedFormatFn>;

/**
 * Equivalent to the `string` type, but tricks TypeScript into prodiving
 * suggestions for string literals passed into the `Suggestions` generic parameter
 *
 * @example
 * type AnyAnimal = StringWithSuggestions<"cat" | "dog">;
 * // Suggests cat and dog, but accepts any string
 * const animal: AnyAnimal = "";
 */
export type StringWithSuggestions<Suggestions extends string> =
  | Suggestions
  | Omit<string, Suggestions>;

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

/**
 * A utility type to get the union of all translation keys from a translation file
 *
 * @example
 * // translations.json
 * {
 *   "Hello": {
 *     "message": "Hello",
 *   },
 *   "Goodbye": {
 *     "message": "Goodbye",
 *   },
 * }
 *
 * // myFile.ts
 * import { TranslationKeys } from '@vocab/core';
 * import translations from './.vocab';
 *
 * // 'Hello' | 'Goodbye'
 * type TheTranslationKeys = TranslationKeys<typeof translations>;
 *
 * @example
 * import { TranslationKeys } from '@vocab/core';
 * import fooTranslations from './foo.vocab';
 * import barTranslations from './bar.vocab';
 *
 * // It even works with multiple translation files
 * type FooBarTranslationKeys = TranslationKeys<typeof fooTranslations | typeof barTranslations>;
 */
export type TranslationKeys<
  Translations extends TranslationFile<any, ParsedFormatFnByKey>,
  // The `extends unknown` here forces TypeScript to distribute over the input type, which might be a union of
  // multiple `TranslationFile`s. Without this, if you pass in a union, TypeScript tries to get the `ReturnType`
  // of a union, which does not work and returns `never`.
  // All types are assignable to `unknown`, so we never hit the `never` case.
> = Translations extends unknown
  ? keyof Awaited<ReturnType<Translations['getMessages']>>
  : never;

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
  languages: LanguageTarget[];
  /**
   * An array of languages to generate from existing translations
   */
  generatedLanguages?: GeneratedLanguageTarget[];
  /**
   * A custom suffix to name vocab translation directories
   */
  translationsDirectorySuffix?: string;
  /**
   * An array of glob paths to ignore from compilation and validation
   */
  ignore?: string[];
}

export type Tags = string[];

export interface TranslationFileMetadata {
  tags?: Tags;
}

export interface TranslationData {
  message: TranslationMessage;
  description?: string;
  tags?: Tags;
  globalKey?: string;
  validated?: boolean;
  skipValidation?: boolean;
}

export type TranslationsByKey<Key extends TranslationKey = string> = Record<
  Key,
  TranslationData
>;

export type TranslationFileContents = TranslationsByKey & {
  _meta?: TranslationFileMetadata;
};

/**
 * Value for a single language in a unified entry: message string or
 * { message, validated? }. Prefer the string form (e.g. "fr": "Bonjour") when
 * no validated flag is needed; use the object form only when required.
 */
export type UnifiedLanguageValue =
  | TranslationMessage
  | { message: TranslationMessage; validated?: boolean };

/**
 * Unified translation entry. Dev language is supplied via the reserved key
 * `message` and/or the dev language code (e.g. `en`). Other languages may
 * appear in `translations` and/or as top-level lang keys. When putting
 * multiple languages in one file, the preferred (new) syntax is the
 * `messages` key.
 */
export type UnifiedTranslationKeyData = {
  allowUnvalidated?: boolean;
  description?: string;
  globalKey?: string;
  /** New syntax: all languages in one object. Preferred when multiple languages in one file. */
  messages?: Record<LanguageName, UnifiedLanguageValue>;
  /** Dev language when present. */
  message?: UnifiedLanguageValue;
  tags?: Tags;
  /** Optional record of lang code → value. */
  translations?: Record<LanguageName, UnifiedLanguageValue>;
  [langCode: string]:
    | UnifiedLanguageValue
    | Record<LanguageName, UnifiedLanguageValue>
    | Tags
    | boolean
    | string
    | undefined;
};

export type UnifiedTranslationFileContents = Record<
  TranslationKey,
  UnifiedTranslationKeyData
> & {
  $namespace?: string;
  _meta?: TranslationFileMetadata;
};

/**
 * @deprecated Use UnifiedTranslationKeyData. Legacy merged format key type.
 */
export type MergedTranslationKeyData = UnifiedTranslationKeyData;

/**
 * @deprecated Use UnifiedTranslationFileContents. Legacy merged format file type.
 */
export type MergedTranslationFileContents = UnifiedTranslationFileContents;

export type MergedTranslationsByKey<Key extends TranslationKey = string> =
  Record<Key, MergedTranslationKeyData>;

export type TranslationMessagesByKey<Key extends TranslationKey = string> =
  Record<Key, TranslationMessage>;

export type TranslationsByLanguage<Key extends TranslationKey = string> =
  Record<LanguageName, TranslationsByKey<Key>>;

/**
 * Runtime view of a loaded translation file: keys and message per language only.
 * Used by compile, webpack, and vite for runtime translation loading.
 */
export type RuntimeLoadedTranslation<Key extends TranslationKey = string> = {
  namespace: string;
  keys: Key[];
  filePath: string;
  relativePath: string;
  messagesByLanguage: Record<LanguageName, TranslationMessagesByKey<Key>>;
};

/**
 * Sync view: one metadata block per key, messages per language.
 * Used by phrase push/pull and validate so metadata is not duplicated per language.
 */
export type SyncTranslationEntryMessage = {
  message: string;
  validated?: boolean;
};

export type SyncTranslationEntry = {
  description?: string;
  globalKey?: string;
  tags?: Tags;
  skipValidation?: boolean;
  allowUnvalidated?: boolean;
  messages: Record<LanguageName, SyncTranslationEntryMessage>;
};

export type SyncLoadedTranslation<Key extends TranslationKey = string> = {
  namespace: string;
  keys: Key[];
  filePath: string;
  relativePath: string;
  metadata: TranslationFileMetadata;
  entries: Record<Key, SyncTranslationEntry>;
};

/**
 * Loaded translation wrapper. Use getRuntimeView() for compile/bundlers (key + message only),
 * getSyncView() for phrase push/pull and validate (unified metadata per key + messages per language).
 */
export interface LoadedTranslation<Key extends TranslationKey = string> {
  namespace: string;
  keys: Key[];
  filePath: string;
  relativePath: string;
  getRuntimeView(): RuntimeLoadedTranslation<Key>;
  getSyncView(): SyncLoadedTranslation<Key>;
}

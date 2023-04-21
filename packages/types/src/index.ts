export type ICUFormatResult<T = unknown> = string | T | (string | T);

export type {
  FormatXMLElementFn,
  LanguageName,
  TranslationKey,
  TranslationMessage,
  ParsedFormatFn,
  ParsedFormatFnByKey,
  StringWithSuggestions,
  ParsedICUMessages,
  TranslationModule,
  TranslationModuleByLanguage,
  TranslationFile,
  Tags,
  TranslationsByKey,
  TranslationFileContents,
  TranslationMessagesByKey,
  TranslationsByLanguage,
  LoadedTranslation,
} from '@vocab/core';

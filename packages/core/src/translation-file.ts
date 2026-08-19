import type {
  TranslationModule,
  TranslationModuleByLanguage,
  ParsedICUMessages,
  LanguageName,
  ParsedFormatFnByKey,
  TranslationFile,
} from './types';

export function createTranslationFile<
  Language extends LanguageName,
  FormatFnByKey extends ParsedFormatFnByKey,
>(
  translationsByLanguage: TranslationModuleByLanguage<Language, FormatFnByKey>,
): TranslationFile<Language, FormatFnByKey> {
  function getByLanguage(language: Language): TranslationModule<FormatFnByKey> {
    const translationModule = translationsByLanguage[language];
    if (!translationModule) {
      throw new Error(
        `Attempted to retrieve translations for unknown language "${language}"`,
      );
    }
    return translationModule;
  }

  const messagesPromiseCache = new Map<
    string,
    Promise<ParsedICUMessages<FormatFnByKey>>
  >();

  return {
    getLoadedMessages(
      language: Language,
      locale?: string,
    ): ParsedICUMessages<FormatFnByKey> | null {
      const translationModule = getByLanguage(language);
      return translationModule.getValue(locale || language) || null;
    },
    getMessages(
      language: Language,
      locale?: string,
    ): Promise<ParsedICUMessages<FormatFnByKey>> {
      const localeToUse = locale || language;
      const cacheKey = `${language}::${localeToUse}`;
      const cachedPromise = messagesPromiseCache.get(cacheKey);

      if (cachedPromise) {
        return cachedPromise;
      }

      const translationModule = getByLanguage(language);
      const promise = translationModule
        .load()
        .then(() => {
          const result = translationModule.getValue(localeToUse);
          if (!result) {
            throw new Error(
              `Unable to find translations for ${language} after attempting to load. Module may have failed to load or an internal error may have occurred.`,
            );
          }
          return result;
        })
        .catch((error: unknown) => {
          messagesPromiseCache.delete(cacheKey);
          throw error;
        });

      messagesPromiseCache.set(cacheKey, promise);
      return promise;
    },
    load(language: Language): Promise<void> {
      const translationModule = getByLanguage(language);
      return translationModule.load();
    },
  };
}

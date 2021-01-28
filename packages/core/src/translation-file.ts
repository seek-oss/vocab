import {
  TranslationModule,
  TranslationModuleByLanguage,
  ParsedICUMessages,
  LanguageName,
  TranslationRequirementsByKey,
  TranslationFile,
} from '@vocab/types';

export function createTranslationFile<
  Language extends LanguageName,
  RequirementsByKey extends TranslationRequirementsByKey
>(
  translationsByLanguage: TranslationModuleByLanguage<
    Language,
    RequirementsByKey
  >,
): TranslationFile<Language, RequirementsByKey> {
  function getByLanguage(
    language: Language,
  ): TranslationModule<RequirementsByKey> {
    const translationModule = translationsByLanguage[language];
    if (!translationModule) {
      throw new Error(
        `Attempted to retrieve translations for unknown language "${language}"`,
      );
    }
    return translationModule;
  }

  return {
    getLoadedMessages(
      language: Language,
      locale?: string,
    ): ParsedICUMessages<RequirementsByKey> | null {
      const translationModule = getByLanguage(language);
      return translationModule.getValue(locale || language) || null;
    },
    getMessages(
      language: Language,
      locale?: string,
    ): Promise<ParsedICUMessages<RequirementsByKey>> {
      const translationModule = getByLanguage(language);
      return translationModule.load().then(() => {
        const result = translationModule.getValue(locale || language);
        if (!result) {
          throw new Error(
            `Unable to find translations for ${language} after attempting to load. Module may have failed to load to an internal error may have occurred.`,
          );
        }
        return result;
      });
    },
    load(language: Language): Promise<void> {
      const translationModule = getByLanguage(language);
      return translationModule.load();
    },
  };
}

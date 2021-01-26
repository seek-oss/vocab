import {
  TranslationModule,
  TranslationModuleByLanguage,
  ParsedICUMessages,
  LanguageName,
  TranslationRequirementsByKey,
} from '@vocab/types';

export function createTranslationFile<
  Language extends LanguageName,
  RequirementsByKey extends TranslationRequirementsByKey
>(
  translationsByLanguage: TranslationModuleByLanguage<
    Language,
    RequirementsByKey
  >,
): {
  getMessages: (
    language: Language,
    locale?: string,
  ) => ParsedICUMessages<RequirementsByKey> | null;
  load: (language: Language) => Promise<void>;
} {
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
    getMessages(
      language: Language,
      locale?: string,
    ): ParsedICUMessages<RequirementsByKey> | null {
      const translationModule = getByLanguage(language);
      return translationModule.getValue(locale || language) || null;
    },
    load(language: Language): Promise<void> {
      const translationModule = getByLanguage(language);
      return translationModule.load();
    },
  };
}

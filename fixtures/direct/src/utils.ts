import translations from './.vocab';

type LanguageName = 'fr' | 'en';

export function preloadLanguage(language: LanguageName) {
  return translations.load(language);
}

export function getSyncMessage(language: LanguageName, locale: string) {
  const languageTranslations = translations.getLoadedMessages(language, locale);
  if (!languageTranslations) {
    // eslint-disable-next-line no-console
    console.error(
      `Translation not available locally for language "${language}" and locale "${locale}"`,
    );
    return null;
  }
  return `${languageTranslations.hello.format()} Synchronously
  ${languageTranslations.vocabPublishDate.format({
    publishDate: 1605847714000,
  })}`;
}

export function getAsyncMessage(language: LanguageName, locale: string) {
  return translations
    .getMessages(language, locale)
    .then(
      (languageTranslations) =>
        `${languageTranslations.hello.format()} Asynchronously`,
    );
}

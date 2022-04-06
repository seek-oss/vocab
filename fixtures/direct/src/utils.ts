import translations from './.vocab';

export type LanguageName = 'fr' | 'en' | 'pseudo';

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
  const publishedText = languageTranslations.vocabPublishDate.format({
    publishDate: 1605847714000,
    strong: (c): string => `*${c}*`,
  });
  const helloText = languageTranslations.hello.format();
  return `${helloText} Synchronously
  ${publishedText}`;
}

export function getAsyncMessage(language: LanguageName, locale: string) {
  return translations
    .getMessages(language, locale)
    .then(
      (languageTranslations) =>
        `${languageTranslations.hello.format()} Asynchronously`,
    );
}

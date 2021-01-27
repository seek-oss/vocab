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
  return `${languageTranslations.hello.format()} Syncronously
  ${languageTranslations.vocabPublishDate.format({
    publishDate: 1605847714000,
  })}`;
}

export async function getAsyncMessage(language: LanguageName, locale: string) {
  const languageTranslations = await translations.getMessages(language, locale);
  return `${languageTranslations.hello.format()} Asyncronously`;
}

import translations from './.vocab';

type LanguageName = 'fr' | 'en';

export function preloadLanguage(language: LanguageName) {
  return translations.load(language);
}

export function getSyncMessage(language: LanguageName, locale: string) {
  const languageTranslations = translations.getMessages(language, locale);
  if (!languageTranslations) {
    // eslint-disable-next-line no-console
    console.error(
      `Translation not available locally for language "${language}" and locale "${locale}"`,
    );
    return null;
  }
  return `${languageTranslations.hello.format()} ${languageTranslations[
    'time is'
  ].format({ currentTime: Date.now() })}`;
}

export async function getAsyncMessage(language: LanguageName, locale: string) {
  let languageTranslations = translations.getMessages(language, locale);
  if (!languageTranslations) {
    await translations.load(language);
    languageTranslations = translations.getMessages(language, locale);
    if (!languageTranslations) {
      throw new Error(
        `Unable to load translations for language "${language}" and locale "${locale}"`,
      );
    }
  }
  return `${languageTranslations.hello.format()} ${languageTranslations.world.format()}`;
}

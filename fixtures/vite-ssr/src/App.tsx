import { useState } from 'react';
import { useTranslations, VocabProvider } from '@vocab/react';

import translations from './App.vocab';
import headerTranslations from './Header.vocab';

const languages = ['en', 'fr', 'en-PSEUDO'] as const;

function Content() {
  const { t } = useTranslations(translations);
  const message = `${t('hello')} ${t('world')}`;

  return <div id="message">{message}</div>;
}

function LanguageToggle({
  lang,
  onToggle,
}: {
  lang: string;
  onToggle: () => void;
}) {
  const { t } = useTranslations(headerTranslations);

  return (
    <button id="toggle-language" onClick={onToggle}>
      {t('toggleLanguage')} ({lang})
    </button>
  );
}

export function App({ initialLanguage }: { initialLanguage: string }) {
  const [lang, setLang] = useState(initialLanguage);

  return (
    <VocabProvider language={lang}>
      <LanguageToggle
        lang={lang}
        onToggle={() =>
          setLang(
            (curr) =>
              languages[
                (languages.indexOf(curr as (typeof languages)[number]) + 1) %
                  languages.length
              ],
          )
        }
      />
      <Content />
    </VocabProvider>
  );
}

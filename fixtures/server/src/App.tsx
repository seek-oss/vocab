import { startTransition, useState } from 'react';
import { useTranslations, VocabProvider } from '@vocab/react';

import translations from './App.vocab';

function Content() {
  const { t } = useTranslations(translations);
  const message = `${t('hello')} ${t('world')}`;

  return <div id="message">{message}</div>;
}

export function App({ initialLanguage }: { initialLanguage: string }) {
  const [lang, setLang] = useState(initialLanguage);

  return (
    <>
      <button
        onClick={() =>
          startTransition(() => {
            setLang((curr) => (curr === 'en' ? 'fr' : 'en'));
          })
        }
      >
        Toggle language
      </button>
      <VocabProvider language={lang}>
        <Content />
      </VocabProvider>
    </>
  );
}

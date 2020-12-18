/* eslint-disable no-console */
import React, { useState } from 'react';
import { useTranslation, VocabProvider } from '@vocab/react';

import translations from './App.vocab';

function Content() {
  const { t, ready } = useTranslation(translations);
  console.log('Rendering translations while', ready ? 'Ready' : 'NOT Ready');
  const message = `${t('hello')} ${t('world')}`;

  return <div id="message">{message}</div>;
}

export function App({ initialLanguage }: { initialLanguage: string }) {
  const [lang, setLang] = useState(initialLanguage);

  return (
    <VocabProvider language={lang}>
      <button
        onClick={() =>
          setLang((curr) => {
            const newLanguage = curr === 'en' ? 'fr' : 'en';
            console.log(`Changing language from ${curr} to ${newLanguage}`);
            return newLanguage;
          })
        }
      >
        Toggle language
      </button>
      <Content />
    </VocabProvider>
  );
}

import { TranslationsProvider, useTranslation } from '@vocab/react';
import React, { ReactNode, useState } from 'react';
import { render } from 'react-dom';

import translations from './client.translations.json';

function Content() {
  const { t } = useTranslation(translations);
  const message = `${t('hello')} ${t('world')}`;

  return <div>{message}</div>;
}

function App({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState('en');

  return (
    <TranslationsProvider language={lang}>
      <button onClick={() => setLang((curr) => (curr === 'en' ? 'fr' : 'en'))}>
        Toggle language
      </button>
      {children}
    </TranslationsProvider>
  );
}

const node = document.createElement('div');

document.body.appendChild(node);

render(
  <App>
    <Content />
  </App>,
  node,
);

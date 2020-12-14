import { VocabProvider, useTranslation } from '@vocab/react';
import React, { ReactNode, useState } from 'react';
import { render } from 'react-dom';

import translations from './translations';

function Content() {
  const { t } = useTranslation(translations);
  const message = `${t('hello')} ${t('world')}`;

  return <div id="message">{message}</div>;
}

function App({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState('en');

  return (
    <VocabProvider language={lang}>
      <button onClick={() => setLang((curr) => (curr === 'en' ? 'fr' : 'en'))}>
        Toggle language
      </button>
      {children}
    </VocabProvider>
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

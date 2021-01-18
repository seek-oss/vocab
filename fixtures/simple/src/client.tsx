import { VocabProvider, useTranslations } from '@vocab/react';
import React, { ReactNode, useState } from 'react';
import { render } from 'react-dom';

import commonTranslations from './.vocab';
import clientTranslations from './client.vocab';

function Content() {
  const common = useTranslations(commonTranslations);
  const client = useTranslations(clientTranslations);
  const message = `${common.t('hello')} ${common.t('world')}`;

  return (
    <>
      <div id="message">{message}</div>
      <div id="publish-date">
        {client.t('vocabPublishDate', { publishDate: 1605847714000 })}
      </div>
    </>
  );
}

function App({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState('en');
  const [locale, setLocale] = useState('en-AU');

  const theLocale = lang === 'en' ? locale : undefined;

  return (
    <VocabProvider language={lang} locale={theLocale}>
      {children}
      <button
        id="toggle-language"
        onClick={() => setLang((curr) => (curr === 'en' ? 'fr' : 'en'))}
      >
        Toggle language: {lang}
      </button>
      {lang === 'en' ? (
        <button
          id="toggle-locale"
          onClick={() =>
            setLocale((curr) => (curr === 'en-AU' ? 'en-US' : 'en-AU'))
          }
        >
          Toggle locale: {locale}
        </button>
      ) : null}
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

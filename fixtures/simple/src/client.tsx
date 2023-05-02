import { VocabProvider, useTranslations } from '@vocab/react';
import React, { type ReactNode, useState } from 'react';
import { render } from 'react-dom';

import commonTranslations from './.vocab';
import clientTranslations from './client.vocab';

function Content() {
  const common = useTranslations(commonTranslations);
  const client = useTranslations(clientTranslations);
  const message = `${common.t('hello')} ${common.t('world')}`;
  const specialCharacterResult = client.t(
    'specialCharacters - \'‘’“”"!@#$%^&*()_+\\/`~\\\\',
  );
  const vocabPublishNode = client.t('vocabPublishDate', {
    publishDate: 1605847714000,
    strong: (children) => <strong>{children}</strong>,
  });

  return (
    <>
      <div id="message">{message}</div>
      <div id="publish-date">{vocabPublishNode}</div>
      <div id="special-characters">
        Special Characters: {specialCharacterResult}
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
      <label htmlFor="languages">Language:</label>
      <select
        name="languages"
        id="language-select"
        onChange={(event) => {
          setLang(event.currentTarget.value);
        }}
      >
        <option value="en">en</option>
        <option value="fr">fr</option>
        <option value="pseudo">pseudo</option>
      </select>
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

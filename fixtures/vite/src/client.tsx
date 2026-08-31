import { VocabProvider, useTranslations } from '@vocab/react';
import type { TranslationKeys } from '@vocab/core';
import { type ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import commonTranslations from './.vocab';
import clientTranslations from './client.vocab';

type CommonTranslationKeys = TranslationKeys<typeof commonTranslations>;

const firstTickEnCommon = commonTranslations.getLoadedMessages('en')
  ? 'loaded'
  : 'missing';
const firstTickEnClient = clientTranslations.getLoadedMessages('en')
  ? 'loaded'
  : 'missing';
const firstTickFrCommon = commonTranslations.getLoadedMessages('fr')
  ? 'loaded'
  : 'missing';

const useCommonTranslation = (key: CommonTranslationKeys) => {
  const { t } = useTranslations(commonTranslations);

  return t(key);
};

function Content() {
  const common = useTranslations(commonTranslations);
  const client = useTranslations(clientTranslations);
  const message = `${common.t('hello')} ${useCommonTranslation('world')}`;
  const specialCharacterResult = client.t(
    'specialCharacters - \'‘’“”"!@#$%^&*()_+\\/`~\\\\',
  );
  const vocabPublishNode = client.t('vocabPublishDate', {
    publishDate: 1605847714000,
    strong: (children: ReactNode) => <strong>{children}</strong>,
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
  const [frSibling, setFrSibling] = useState('pending');

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
        <option value="fr-FR">fr-FR</option>
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
      <div id="sync-en-common">{firstTickEnCommon}</div>
      <div id="sync-en-client">{firstTickEnClient}</div>
      <div id="sync-fr-initial">{firstTickFrCommon}</div>
      <button
        id="load-fr-sibling"
        onClick={async () => {
          await clientTranslations.load('fr');
          setFrSibling(
            commonTranslations.getLoadedMessages('fr') ? 'loaded' : 'missing',
          );
        }}
      >
        Load FR sibling
      </button>
      <div id="sync-fr-sibling">{frSibling}</div>
    </VocabProvider>
  );
}

const node = document.createElement('div');

document.body.appendChild(node);

createRoot(node).render(
  <App>
    <Content />
  </App>,
);

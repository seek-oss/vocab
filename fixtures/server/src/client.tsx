/* eslint-disable no-console */
import React from 'react';
import { hydrate } from 'react-dom';
import { loadableReady } from '@loadable/component';

import translations from './App.vocab';

import { App } from './App';

declare global {
  interface Window {
    INITIAL_LANGUAGE: string;
  }
}

function vocabReady(language: string, callback: () => void) {
  console.log('Starting to load vocab:', language);
  translations[language].load().then(() => {
    console.log('Vocab Ready');
    callback();
  });
}

loadableReady(() => {
  vocabReady(window.INITIAL_LANGUAGE, () => {
    const root = document.getElementById('main');
    console.log('Using window.INITIAL_LANGUAGE', window.INITIAL_LANGUAGE);
    hydrate(<App initialLanguage={window.INITIAL_LANGUAGE} />, root);
  });
});

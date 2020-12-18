import React from 'react';
import { hydrate } from 'react-dom';
import { loadableReady } from '@loadable/component';

import { App } from './App';

declare global {
  interface Window {
    INITIAL_LANGUAGE: string;
  }
}

loadableReady(() => {
  const root = document.getElementById('main');
  hydrate(<App initialLanguage={window.INITIAL_LANGUAGE} />, root);
});

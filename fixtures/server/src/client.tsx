import React from 'react';
import { hydrate } from 'react-dom';
import { loadableReady } from '@loadable/component';

import { App } from './App';
import { VocabProvider } from '@vocab/react';

declare global {
  interface Window {
    INITIAL_LANGUAGE: string;
  }
}

loadableReady(() => {
  const root = document.getElementById('main');
  hydrate(
    <VocabProvider language={window.INITIAL_LANGUAGE}>
      <App />
    </VocabProvider>,
    root,
  );
});

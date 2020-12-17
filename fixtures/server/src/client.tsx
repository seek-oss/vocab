import React from 'react';
import { hydrate } from 'react-dom';
import { loadableReady } from '@loadable/component';

import { App } from './App';

loadableReady(() => {
  const root = document.getElementById('main');
  console.log('Using window.INITIAL_LANGUAGE', window.INITIAL_LANGUAGE);
  hydrate(<App initialLanguage={window.INITIAL_LANGUAGE} />, root);
});

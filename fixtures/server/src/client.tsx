import { hydrateRoot } from 'react-dom/client';
import { loadableReady } from '@loadable/component';

import { App } from './App';

declare global {
  interface Window {
    INITIAL_LANGUAGE: string;
  }
}

loadableReady(() => {
  const root = document.getElementById('main');
  hydrateRoot(root!, <App initialLanguage={window.INITIAL_LANGUAGE} />);
});

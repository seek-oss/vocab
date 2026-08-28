import { hydrateRoot } from 'react-dom/client';

import { App } from './App';

declare global {
  interface Window {
    INITIAL_LANGUAGE: string;
  }
}

// Hydrate immediately, without waiting for language chunks.
hydrateRoot(
  document.getElementById('root')!,
  <App initialLanguage={window.INITIAL_LANGUAGE} />,
);

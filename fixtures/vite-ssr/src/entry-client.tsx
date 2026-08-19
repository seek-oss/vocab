import { hydrateRoot } from 'react-dom/client';
import { getChunkName } from '@vocab/vite/get-chunk-name';

import { App } from './App';

declare global {
  interface Window {
    INITIAL_LANGUAGE: string;
  }
}

const chunkName = getChunkName(window.INITIAL_LANGUAGE);
await import(/* @vite-ignore */ `/${chunkName}.js`);

hydrateRoot(
  document.getElementById('root')!,
  <App initialLanguage={window.INITIAL_LANGUAGE} />,
);

/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';

import express, { type Request, type Response } from 'express';
import { renderToString } from 'react-dom/server';
import { getChunkName } from '@vocab/vite/chunks';
import type { Manifest } from 'vite';

import { App } from './App';

const clientDir = path.resolve(process.cwd(), 'dist/client');

const getTranslationsChunkHref = (manifest: Manifest, language: string) => {
  const chunkName = getChunkName(language);
  const chunk = Object.values(manifest).find(
    (entry) => entry.name === chunkName,
  );

  if (!chunk) {
    throw new Error(
      `No chunk named "${chunkName}" found in the client build manifest`,
    );
  }

  return `/${chunk.file}`;
};

const start = async () => {
  const template = await fs.readFile(
    path.join(clientDir, 'index.html'),
    'utf-8',
  );

  const manifest: Manifest = JSON.parse(
    await fs.readFile(path.join(clientDir, '.vite/manifest.json'), 'utf-8'),
  );

  const app = express();

  app.use(express.static(clientDir, { index: false }));

  app.get('*splat', (req: Request, res: Response) => {
    console.log('Received request', req.url);
    const language = req.path.startsWith('/en') ? 'en' : 'fr';

    console.log({ appPath: req.path, language });

    const appHtml = renderToString(<App initialLanguage={language} />);
    const translationsChunkHref = getTranslationsChunkHref(manifest, language);

    const html = template
      .replace(
        '<!--ssr-head-->',
        `<script>window.INITIAL_LANGUAGE=${JSON.stringify(language)};</script>
        <link rel="modulepreload" href="${translationsChunkHref}" crossorigin>
        <script type="module" src="${translationsChunkHref}"></script>`,
      )
      .replace('<!--ssr-outlet-->', appHtml);

    res.status(200).set('Content-Type', 'text/html').send(html);
  });

  console.log(`Starting server on port ${process.env.SERVER_PORT}`);
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}.`);
  });
};

start().catch((error) => {
  console.error(error);
});

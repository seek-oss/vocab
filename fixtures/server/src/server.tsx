/* eslint-disable no-console */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import path from 'path';
import { getChunkName } from '@vocab/webpack/chunk-name';

// @ts-expect-error Haven't loaded webpack types
const statsFile = __non_webpack_require__('../dist-client/loadable-stats.json');

import { App } from './App';

import express from 'express';

import type { Request, Response } from 'express';

const app = express();

app.use(
  '/static',
  express.static(path.resolve('./dist-client'), { fallthrough: false }),
);

app.get('*', (req: Request, res: Response) => {
  console.log('Recieved request', req.url);
  const appPath = req.path;
  const language = appPath.startsWith('/en') ? 'en' : 'fr';

  console.log({ appPath, language });

  const extractor = new ChunkExtractor({ stats: statsFile });

  // @ts-expect-error addChunk is not documented in types
  extractor.addChunk(getChunkName(language));

  const jsx = extractor.collectChunks(<App initialLanguage={language} />);

  const appHtml = renderToString(jsx);

  const scriptTags = extractor.getScriptTags();

  res.send(
    `<html><head><title>fixture-server</title></head><body><script>window.INITIAL_LANGUAGE="${language}";</script><div id="main">${appHtml}</div>${scriptTags}</body></head>`,
  );
});

console.log(`Starting server on port ${process.env.SERVER_PORT}`);
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening on port ${process.env.SERVER_PORT}.`);
});

#!/usr/bin/env ts-node
import { promises as fs } from 'fs';
import path from 'path';

import { buildFixture } from './helpers';

const fixtureName = process.argv[2];

fs.rmdir(
  path.join(
    path.dirname(require.resolve(`${fixtureName}/package.json`)),
    'dist',
  ),
  {
    recursive: true,
  },
)
  .then(() => buildFixture(fixtureName))
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Fixture built');
  });

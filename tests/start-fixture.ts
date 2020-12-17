#!/usr/bin/env ts-node
import { startFixture } from './helpers';

const fixtureName = process.argv[2];

const serverRendered = fixtureName === 'fixture-server';

startFixture(process.argv[2], { enableServerRender: serverRendered }).then(
  (server) => {
    // eslint-disable-next-line no-console
    console.log('Fixture running on', server.url);
  },
);

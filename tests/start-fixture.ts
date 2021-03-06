#!/usr/bin/env ts-node
import { startFixture } from './helpers';

const fixtureName = process.argv[2];

startFixture(fixtureName).then((server) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

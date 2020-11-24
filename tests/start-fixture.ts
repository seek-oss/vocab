#!/usr/bin/env ts-node
import { startFixture } from './helpers';

startFixture(process.argv[2]).then((server) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

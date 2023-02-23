#!/usr/bin/env ts-node
import { FixtureName, startFixture } from './helpers';

const fixtureName = process.argv[2] as FixtureName;

startFixture(fixtureName).then((server) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

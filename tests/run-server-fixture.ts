#!/usr/bin/env ts-node
import { runServerFixture } from './helpers';

const fixtureName = process.argv[2];

runServerFixture(fixtureName).then((server: any) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

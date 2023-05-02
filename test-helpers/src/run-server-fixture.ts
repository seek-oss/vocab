#!/usr/bin/env ts-node
import { type FixtureName, runServerFixture } from './helpers';

const fixtureName = process.argv[2] as FixtureName;

runServerFixture(fixtureName).then((server: any) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

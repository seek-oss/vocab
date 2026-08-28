import { type FixtureName, runViteSsrFixture } from './helpers';

const fixtureName = process.argv[2] as FixtureName;

runViteSsrFixture(fixtureName).then((server: any) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

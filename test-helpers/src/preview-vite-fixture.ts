import { type FixtureName, previewViteFixture } from './helpers';

const fixtureName = process.argv[2] as FixtureName;

if (!fixtureName) {
  throw new Error('Please provide a fixture name');
}

previewViteFixture(fixtureName).then((server) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

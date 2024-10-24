import { type FixtureName, startFixture } from './helpers';

const fixtureName = process.argv[2] as FixtureName;

const bundler = process.argv[3] as 'webpack' | 'vite' | undefined;

if (!fixtureName) {
  throw new Error('Please provide a fixture name');
}

if (!bundler) {
  // eslint-disable-next-line no-console
  console.log('Bundler not provided, defaulting to webpack');
}

startFixture(fixtureName, { bundler }).then((server) => {
  // eslint-disable-next-line no-console
  console.log('Fixture running on', server.url);
});

import path from 'path';

import VocabWebpackPlugin from '@vocab/webpack';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpackMerge from 'webpack-merge';
import WDS from 'webpack-dev-server';

export const makeWebpackConfig = (fixtureName: string, config: any = {}) => {
  const fixtureConfig = require.resolve(`${fixtureName}/vocab.config.js`);

  return webpackMerge(
    {
      entry: require.resolve(`${fixtureName}/src/client.tsx`),
      resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx'],
      },
      mode: 'development',
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.(js|ts|tsx)$/,
            include: path.dirname(fixtureConfig),
            use: [
              {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  presets: [
                    ['@babel/preset-env', { modules: false }],
                    '@babel/preset-typescript',
                    '@babel/preset-react',
                  ],
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new VocabWebpackPlugin({ configFile: fixtureConfig }),
      ],
    },
    config,
  );
};

export interface TestServer {
  url: string;
  close: () => void;
}

let portCounter = 10001;

export const startFixture = (fixtureName: string): Promise<TestServer> =>
  new Promise((resolve) => {
    const compiler = webpack(makeWebpackConfig(fixtureName));

    const port = portCounter++;
    const server = new WDS(compiler);

    compiler.hooks.done.tap('vocab-test-helper', () => {
      resolve({ url: `http://localhost:${port}`, close: () => server.close() });
    });

    server.listen(port);
  });

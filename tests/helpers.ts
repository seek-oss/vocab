/* eslint-disable no-console */
import path from 'path';

import VocabWebpackPlugin from '@vocab/webpack';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpackMerge from 'webpack-merge';
// import WDS from 'webpack-dev-server';
import LoadablePlugin from '@loadable/webpack-plugin';

import { spawn } from 'child_process';
import { convertCompilerOptionsFromJson } from 'typescript';

interface Options {
  config?: any;
  port?: number;
  disableVocabPlugin?: boolean;
  enableServerRender?: boolean;
}

const makeServerConfig = (fixtureName: string) => ({
  name: 'server',
  entry: { server: require.resolve(`${fixtureName}/src/server.tsx`) },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  output: {
    path: path.join(
      path.dirname(require.resolve(`${fixtureName}/package.json`)),
      'dist-server',
    ),
  },
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        include: [path.resolve('fixtures'), path.resolve('packages')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              plugins: ['@loadable/babel-plugin'],
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
});

export const makeWebpackConfig = (
  fixtureName: string,
  {
    config = {},
    disableVocabPlugin = false,
    enableServerRender = false,
    port,
  }: Options = {},
) => {
  const fixtureConfig = require.resolve(`${fixtureName}/vocab.config.js`);

  const clientConfig = webpackMerge(
    {
      name: 'client',
      entry: require.resolve(`${fixtureName}/src/client.tsx`),
      resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx'],
      },
      output: {
        publicPath: `/static/`,
        path: path.join(
          path.dirname(require.resolve(`${fixtureName}/package.json`)),
          'dist-client',
        ),
      },
      mode: 'development',
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.(js|ts|tsx)$/,
            include: [path.resolve('fixtures'), path.resolve('packages')],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  plugins: ['@loadable/babel-plugin'],
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
      plugins: [new HtmlWebpackPlugin(), new LoadablePlugin()],
    },
    disableVocabPlugin
      ? {}
      : { plugins: [new VocabWebpackPlugin({ configFile: fixtureConfig })] },
    config,
  );
  if (!enableServerRender) {
    return clientConfig;
  }
  return [clientConfig, makeServerConfig(fixtureName)];
};

export interface TestServer {
  url: string;
  close: () => void;
}

let portCounter = 10001;

export const startFixture = (
  fixtureName: string,
  options?: Options,
): Promise<TestServer> =>
  new Promise((resolve) => {
    console.log({ options });
    const port = portCounter++;
    const compiler = webpack(
      makeWebpackConfig(fixtureName, { ...options, port }),
    );

    let childProcess: any;

    compiler.hooks.done.tap('vocab-test-helper', () => {
      console.log('Done hook');
      if (options?.enableServerRender) {
        const cwd = path.dirname(
          require.resolve(`${fixtureName}/vocab.config.js`),
        );
        childProcess = spawn('node', ['./dist-server/server.js'], {
          stdio: 'inherit',
          cwd,
        });
      }
      console.log('Resolving.');
      resolve({
        url: `http://localhost:${port}`,
        close: () => {
          childProcess.kill();
        },
      });
    });
    compiler.hooks.watchRun.tap('vocab-test-helper', () => childProcess.kill());
    compiler.run(() => {
      console.log('Run running...');
    });
    // compiler.watch({}, () => {
    //   console.log('Watch handler called');
    // });
    // setTimeout(() => {
    //   console.log('timeout');
    // }, 30000);
  });

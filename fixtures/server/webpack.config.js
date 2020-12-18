const path = require('path');

const VocabWebpackPlugin = require('@vocab/webpack').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');

module.exports = () => [
  {
    name: 'client',
    entry: require.resolve('./src/client.tsx'),
    resolve: {
      extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    output: {
      publicPath: `/static/`,
      path: path.join(__dirname, 'dist-client'),
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: [/node_modules/],
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
    plugins: [
      new HtmlWebpackPlugin(),
      new LoadablePlugin(),
      new VocabWebpackPlugin({
        configFile: require.resolve('./vocab.config.js'),
      }),
    ],
  },
  {
    name: 'server',
    entry: { server: require.resolve('./src/server.tsx') },
    resolve: {
      extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    output: {
      path: path.join(__dirname, 'dist-server'),
    },
    target: 'node',
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: [/node_modules/],
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
  },
];

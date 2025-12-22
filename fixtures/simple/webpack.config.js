const { VocabWebpackPlugin } = require('@vocab/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = ({ disableVocabPlugin }) => ({
  entry: require.resolve('./src/client.tsx'),
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
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
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              presets: [
                ['@babel/preset-env', { modules: false }],
                '@babel/preset-typescript',
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    ...(disableVocabPlugin
      ? []
      : [
          new VocabWebpackPlugin({
            configFile: require.resolve('./vocab.config.cjs'),
          }),
        ]),
  ],
});

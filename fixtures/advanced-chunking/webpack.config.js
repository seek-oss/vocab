const path = require('path');
const VocabWebpackPlugin = require('@vocab/webpack').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: require.resolve('./src/client.ts'),
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  mode: 'production',
  optimization: {
    minimize: false,
    runtimeChunk: { name: 'runtime' },
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
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
    new VocabWebpackPlugin({
      configFile: require.resolve('./vocab.config.js'),
    }),
  ],
};

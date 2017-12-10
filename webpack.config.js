const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  context: path.resolve(__dirname, 'js'),
  entry: {
    app: './main.js',
    common:   [
      'react',
      'react-dom',
      './main.css'
    ]
  },
  target: "web",
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
      test: /\.css$/
      , use: ExtractTextPlugin.extract({
        use: [ 'css-loader', 'postcss-loader' ]
      })
    }, {
      test: /\.(gif|jpg|png)$/,
      use: "file-loader?name=[path][name].[ext]"
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    inline: true,
    host: '0.0.0.0',
    port: 8080,
    historyApiFallback: true,
    watchContentBase: true,
    stats: {colors: true},
    proxy: {
      '/api': 'http://localhost:8081'
    }
  },
  performance: {
    hints: "warning",
    maxAssetSize: 1280000,
    maxEntrypointSize: 1280000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.css')
        || assetFilename.endsWith('.js');
    }
  },
  plugins: [
    new Dotenv(),
    new ExtractTextPlugin({
      filename: 'common.css'
    }),
    new webpack.optimize.UglifyJsPlugin({
      warnings:  true,
      sourceMap: true,
      mangle:    true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name:     'common',
      filename: 'common.js',
      minChunk: Infinity
    })
  ],
  devtool: 'source-map'
};

module.exports = config;

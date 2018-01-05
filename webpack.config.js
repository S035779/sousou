const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv-webpack');

const config = {
  context: path.resolve(__dirname, 'src'),
  target: "web",
  entry: {
    app: [
      './assets/js/jquery.validate.min.js',
      './assets/js/jquery.ah-placeholder.min.js',
      './assets/js/lightbox-plus-jquery.js',
      './assets/js/featherlight.min.js',
      './assets/js/formlayout_script.js',
      './main.js',
    ],
    commons: [
      'react',
      'react-dom',
      'react-hot-loader/patch',
      'flux',
      './assets/css/lightbox.css',
      './assets/css/featherlight.min.css',
      './main.css',
    ],
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    host: '0.0.0.0',
    port: 4443,
    historyApiFallback: true,
    watchContentBase: true,
    disableHostCheck: true,
    stats: {colors: true},
    proxy: {
      '/api': 'http://localhost:8081',
    },
    https: {
      key: fs.readFileSync(path.join(__dirname, 'ssl/server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl/server.crt'))
    }
  },
  plugins: [
    new ManifestPlugin(),
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: 'index.html',
      favicon: 'assets/image/favicon.ico',
    }),
    new dotenv(),
    new ExtractTextPlugin({
      filename: 'commons.css'
    }),
    new webpack.optimize.UglifyJsPlugin({
      warnings:  true,
      sourceMap: true,
      mangle:    true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name:     'commons',
      filename: 'commons.js',
      minChunk: Infinity
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: [
          'babel-loader'
        ],
      },
      {
        test: /\.css$/
        , use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            'postcss-loader'
          ]
        })
      },
      {
        test: /\.(gif|jpg|png|svg)$/,
        use: [
          'file-loader?name=[name].[ext]'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader?name=[name].[ext]'
        ]
      },
      {
        test: /\.(csv|tsv)$/,
        use: [
          'csv-loader'
        ]
      },
      {
        test: /\.xml$/,
        use: [
          'xml-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      Assets: path.resolve(__dirname, 'src/assets/'),
      Utilities: path.resolve(__dirname, 'src/utils/'),
      Stores: path.resolve(__dirname, 'src/stores'),
      Actions: path.resolve(__dirname, 'src/actions'),
      Components: path.resolve(__dirname, 'src/components'),
      Services: path.resolve(__dirname, 'src/services'),
      Pages: path.resolve(__dirname, 'src/pages'),
      Csv: path.resolve(__dirname, 'src/csv'),
      Xml: path.resolve(__dirname, 'src/xml')
    },
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
};

module.exports = config;

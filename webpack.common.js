const dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  target: "web",
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: [
      './assets/js/jquery.validate.min.js',
      './assets/js/jquery.ah-placeholder.min.js',
      './assets/js/jquery.exresize-latest.js',
      './assets/js/featherlight.min.js',
      './formlayout.js',
      'react-hot-loader/patch',
      './main.js',
    ],
    css: [
      './assets/css/featherlight.min.css',
      './main.css',
    ],
    widget: './widget.js',
  },
  plugins: [
    new dotenv(),
    new CleanWebpackPlugin(['dist']),
    new ManifestPlugin(),
    new ExtractTextPlugin({ filename: 'style.css' }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  externals: {
    'jquery':     'jQuery',
    'react':      'React',
    'react-dom':  'ReactDOM'
  },
  module: {
    rules: [{
        test: require.resolve('./src/assets/js/log4js.min.js'),
        use: 'exports-loader?Log4js'
      },{ 
        test: /\.js$/,
        loader: [ 'babel-loader' ]
      },{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [ 'css-loader', 'postcss-loader' ]
        })
      },{
        test: /\.(gif|jpg|png|svg|ico)$/,
        use: [ 'file-loader?name=[name].[ext]' ]
      }]
  },
  resolve: {
    alias: {
      Main: path.resolve(__dirname, 'src/'),
      Assets: path.resolve(__dirname, 'src/assets/'),
      Utilities: path.resolve(__dirname, 'src/utils/'),
      Stores: path.resolve(__dirname, 'src/stores'),
      Actions: path.resolve(__dirname, 'src/actions'),
      Components: path.resolve(__dirname, 'src/components'),
      Services: path.resolve(__dirname, 'src/services'),
      Pages: path.resolve(__dirname, 'src/pages')
    }
  }
};

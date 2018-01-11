const dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
      './assets/js/lightbox-plus-jquery.js',
      './assets/js/featherlight.min.js',
      './assets/css/lightbox.css',
      './assets/css/featherlight.min.css',
      './formlayout.js',
      'react-hot-loader/patch',
      './main.js',
      './main.css',
    ],
    widget: './widget.js',
  },
  plugins: [
    new dotenv(),
    new HtmlWebpackPlugin({ template: 'index.html', inject: false }),
    new CleanWebpackPlugin(['dist']),
    new ManifestPlugin(),
    new ExtractTextPlugin({ filename: 'style.css' }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [{ 
        test: require.resolve('./src/utils/log4js.min.js'),
        loader: 'exports-loader?Log4js'
      },{ 
        test: /\.js$/,
        loader: [ 'babel-loader' ]
      },{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [ 'css-loader', 'postcss-loader' ]
        })
      },{
        test: /\.(gif|jpg|png|svg)$/,
        use: [ 'file-loader?name=[name].[ext]' ]
      },{
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [ 'file-loader?name=[name].[ext]' ]
      },{
        test: /\.(csv|tsv)$/, use: [ 'csv-loader' ]
      },{
        test: /\.xml$/,       use: [ 'xml-loader' ]
    }]
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
};

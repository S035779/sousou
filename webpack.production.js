const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true
    }),
  ],
  performance: {
    hints: "warning",
    maxAssetSize: 1280000,
    maxEntrypointSize: 1280000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.css')
        || assetFilename.endsWith('.js');
    }
  },
});

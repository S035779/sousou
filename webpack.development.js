const merge = require('webpack-merge');
const fs = require('fs');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'inline-source-map',
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
});


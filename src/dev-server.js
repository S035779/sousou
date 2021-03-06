import dotenv from 'dotenv';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.development.js';
import fs from 'fs';
import https from 'https';
import proxy from 'http-proxy-middleware';
import url from 'url';
import serveStatic from 'serve-static';
import favicon from 'serve-favicon';
import path from 'path';
import { logs as log } from './utils/logutils';
log.config('console', 'color', 'dev-server', 'TRACE');
dotenv.config();
const https_port = config.devServer.port || 4443;
const https_host = config.devServer.host || '127.0.0.1'
const ssl_keyset = {
  key: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'server.key'))
  , cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'server.crt'))
};
const compiler = webpack(config);
const app = express();
app.use(log.connect());
app.use(webpackDevMiddleware(compiler,
  {publicPath: config.output.publicPath}));
app.use(webpackHotMiddleware(compiler));
app.use(favicon(path.join(__dirname, 'assets', 'image', 'favicon.ico')));
app.use('/api', proxy('http://localhost:8081'));
app.use('/assets', serveStatic(path.join(__dirname, '..', 'public')));
https.createServer(ssl_keyset, app).listen(https_port, https_host, () => {
  log.info(`Secure HTTP Server listening on ${https_host}:${https_port}`);
});

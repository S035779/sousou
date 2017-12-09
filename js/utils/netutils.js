var log = require('./logutils').logs;
var std = require('./stdutils');
/*
 * An 'netutils' module for Node.
 */

/*
 * Simple HTTP GET request
 */
var get = function(url, callback) {  
  url = require('url').parse(url);
  var hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;

  var client = require('http');
  var req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    var stat = res.statusCode;
    var head = res.headers;
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 200:
          process.stdout.write('-');
          if (callback) callback(stat, head, body);
          break;
        case 400: case 401: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          if (callback) callback(stat, head, body);
          break; 
        case 500: case 503:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          get(url, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          if (callback) callback(stat, head, body);
          break;
      }
    });
  });

  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    log.trace(`${err.message}`);
    log.trace(`${err.stack}`);
  });
};
module.exports.get = get;

/*
 * Advanced HTTPS GET request
 */
var get2 = function(url, callback) {  
  url = require('url').parse(url);
  var hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;

  var client = require('https');
  var req = client.get({
    host: hostname
    , port: port
    , path: path
  }, function(res) {
    var stat = res.statusCode;
    var head = res.headers;
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 200:
          process.stdout.write('-');
          if (callback) callback(stat, head, body);
          break;
        case 400: case 401: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          if (callback) callback(stat, head, body);
          break; 
        case 500: case 503:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          get(url, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          if (callback) callback(stat, head, body);
          break;
      }
    });
  });

  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    log.trace(`${err.message}`);
    log.trace(`${err.stack}`);
  });
};
module.exports.get2 = get2;

/*
 * Simple HTTP POST request with data as the request body
 */
var post = function(url, data, callback) {
  url = require('url').parse(url);
  var hostname  = url.hostname
    , port      = url.port || 80
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;

  var type;
  if (data == null) data = '';
  if (data instanceof Buffer)
    type = 'application/octet-stream';
  else if (typeof data === 'string')
    type = 'text/plain; charset=UTF-8';
  else if (typeof data === 'object') {
    data = require('querystring').stringify(data);
    type = 'application/x-www-form-urlencoded';
  }

  var client = require('http');
  var req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': type,
      'Content-Length': Buffer.byteLength(data)
    }
  }, function(res) {
    var stat = res.statusCode;
    var head = res.headers;
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 200:
          process.stdout.write('-');
          if (callback) callback(stat, head, body);
          break;
        case 400: case 401: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          res.resume();
          return; 
        case 500: case 503:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          post(url, data, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          if (callback) callback(stat, head, body);
          break;
      }
    });
  });

  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    log.trace(`${err.message}`);
    log.trace(`${err.stack}`);
  });

  req.write(data);
  req.end();
};
module.exports.post = post;

/*
 * Advanced HTTPS POST request with data as the request body
 */
var post2 = function(url, headers, data, callback) {
  url = require('url').parse(url);
  var hostname  = url.hostname
    , port      = url.port || 443
    , path      = url.pathname
    , query     = url.query;
  if (query) path += '?' + query;

  var type;
  if (data == null) data = '';
  if (data instanceof Buffer)
    type = 'application/octet-stream';
  else if (typeof data === 'string')
    type = 'text/plain; charset=UTF-8';
  else if (typeof data === 'object') {
    data = require('querystring').stringify(data);
    type = 'application/x-www-form-urlencoded';
  }
  headers['Content-Type'] =  type;
  headers['Content-Length'] =  Buffer.byteLength(data);

  var client = require('https');
  var req = client.request({
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: headers
  }, function(res) {
    var stat = res.statusCode;
    var head = res.headers;
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      switch (stat) {
        case 200:
          process.stdout.write('-');
          if (callback) callback(stat, head, body);
          break;
        case 400: case 401: case 403: case 404:
          log.error(`HTTP Request Failed. Status Code: ${stat}`);
          log.trace(`Header:`, head);
          log.trace(`Body:`, body);
          res.resume();
          return; 
        case 500: case 503:
          process.stdout.write('x');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          post(url, data, callback);
          break;
        default:
          process.stdout.write('?');
          log.warn(`HTTP Request Failed. Status Code: ${stat}`);
          if (callback) callback(stat, head, body);
          break;
      }
    });
  });

  req.on('error', function(err) {
    log.error(`Problem with HTTP Request: ${err.code}`);
    log.trace(`${err.message}`);
    log.trace(`${err.stack}`);
  });

  req.write(data);
  req.end();
};
module.exports.post2 = post2;


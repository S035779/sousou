import dotenv from 'dotenv';
import React from 'react';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || '';
const assets = process.env.ASSET_PATH || '';

const paypal_path = 'https://www.paypalobjects.com/api/checkout.js';
const jquery_path = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js';

let path_to_js = ''; 
let path_to_css = '';
let log4js_path = '';
if (env === 'development') {
  log4js_path = assets + '/js/log4js.min.js';
} else if (env === 'staging' || env === 'production') {
  path_to_js  = host + assets + '/js';
  path_to_css = host + assets + '/css';
  log4js_path = host + assets + '/js/log4js.min.js';
}

class Home extends React.Component {
  render() {
    const initialProps = {
      language: this.props.language
      , length: this.props.length
      , weight: this.props.weight
      , from: this.props.from
      , usd: this.props.usd
      , jpy: this.props.jpy
    };
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>PayPal Payment</title>
      <link rel="shortcut icon" href={ path_to_css + "/favicon.ico" } />
      <link rel="stylesheet"    href={ path_to_css + "/commons.css" } />
      <script src={ paypal_path }></script>
      <script src={ jquery_path }></script>
      <script src={ log4js_path }></script>
      </head>
      <body>
      <div id="app"></div>
      <div id="initialProps"
        data-json={ JSON.stringify(initialProps)  }></div>
      <script src={ path_to_js + "/commons.js"    }></script>
      <script src={ path_to_js + "/app.bundle.js" }></script>
      </body>
      </html>;
  }
}
export default Home;

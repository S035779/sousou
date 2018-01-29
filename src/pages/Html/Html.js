import dotenv from 'dotenv';
import React from 'react';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || '';
const assets = process.env.ASSET_PATH || '';
const paypal_path = 'https://www.paypalobjects.com/api/checkout.js';
const jquery_path
  = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js';

let react_path = '';
let react_dom_path = '';
let path_to_js = ''; 
let path_to_css = '';
if (env === 'development') {
  react_path = 'https://unpkg.com/react@16/umd/react.development.js';
  react_dom_path
    = 'https://unpkg.com/react-dom@16/umd/react-dom.development.js';
} else if (env === 'staging' || env === 'production') {
  react_path = 'https://unpkg.com/react@16/umd/react.production.min.js';
  react_dom_path
    = 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js';
  path_to_js  = host + assets + '/js';
  path_to_css = host + assets + '/css';
}

class Html extends React.Component {
  render() {
    const { initialStat, initialData } = this.props;
    return <html>
      <head>
      <meta charSet="utf-8" />
      <meta name="viewport"
        content="width=device-width, maximum-scale=1.0, minimum-scale=0.5,user-scalable=yes,initial-scale=1.0" />
      <title>PayPal Payment</title>
      <link rel="stylesheet"    href={ path_to_css + '/style.css' } />
      <script src={ paypal_path }></script>
      <script src={ jquery_path }></script>
      <script crossOrigin="true" src={ react_path     }></script>
      <script crossOrigin="true" src={ react_dom_path }></script>
      </head>
      <body>
      <div id="app"></div>
      <script id="initial-data" type="text/plain"
        data-init={ initialData } data-stat={ initialStat }></script>
      <script src={ path_to_js + "/app.bundle.js" }></script>
      </body>
      </html>;
  }
}
export default Html;

import dotenv from 'dotenv';
import React from 'react';
//import App from '../../pages/App/App';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || '';
const assets = process.env.ASSET_PATH || '';
const paypal_path = 'https://www.paypalobjects.com/api/checkout.js';
const jquery_path = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js';
//const react_router_path = 'https://unpkg.com/react-router/umd/react-router.min.js';
//const react_router_dom_path = 'https://unpkg.com/react-router-dom/umd/react-router-dom.min.js';
//const react_router_config_path = 'https://unpkg.com/react-router-config/umd/react-router-config.min.js';

let react_path = '';
let react_dom_path = '';
let path_to_js = ''; 
let path_to_css = '';
let path_to_img = '';
if (env === 'development') {
  react_path = 'https://unpkg.com/react@16/umd/react.development.js';
  react_dom_path = 'https://unpkg.com/react-dom@16/umd/react-dom.development.js';
} else if (env === 'staging' || env === 'production') {
  react_path = 'https://unpkg.com/react@16/umd/react.production.min.js';
  react_dom_path = 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js';
  path_to_js  = host + assets + '/js';
  path_to_css = host + assets + '/css';
  path_to_img = host + assets + '/image';
}

class Home extends React.Component {
  render() {
    const { init, stat } = this.props;
    //const content
    //  = React.renderToString(React.createElement(App, initialData));
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>PayPal Payment</title>
      <link rel="shortcut icon" href={ path_to_img + '/favicon.ico' } />
      <link rel="stylesheet"    href={ path_to_css + '/style.css' } />
      <script src={ paypal_path }></script>
      <script src={ jquery_path }></script>
      <script crossOrigin="true" src={ react_path     }></script>
      <script crossOrigin="true" src={ react_dom_path }></script>
      {/*
      <script src={ react_router_path        }></script>
      <script src={ react_router_dom_path    }></script>
      <script src={ react_router_config_path }></script>
      */}
      </head>
      <body>
      <div id="app">{/*{content}*/}</div>
      <script id="initial-data" type="text/plain"
        data-init={ JSON.stringify(init) }
        data-stat={ JSON.stringify(stat) }></script>
      <script src={ path_to_js + "/app.bundle.js" }></script>
      </body>
      </html>;
  }
}
export default Home;

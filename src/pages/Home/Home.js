import dotenv from 'dotenv';
import React from 'react';

dotenv.config();
const ssl_host = process.env.TOP_URL || 'https://localhost:4443';

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
      <link rel="shortcut icon" href={ssl_host + "/favicon.ico"} />
      <link rel="stylesheet" href={ssl_host + "/commons.css"} />
      <script src="https://www.paypalobjects.com/api/checkout.js">
      </script>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
      <script src={ssl_host + "/public/log4js.min.js"}></script>
      </head>
      <body>

      <div id="app"></div>
      <div id="initialProps" data-json={JSON.stringify(initialProps)}></div>
      <script src={ssl_host + "/commons.js"}></script>
      <script src={ssl_host + "/app.bundle.js"}></script>
      </body>
      </html>;
  }
}
export default Home;

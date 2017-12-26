import React from 'react';

class Home extends React.Component {
  render() {
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>PayPalPayment</title>
      <link rel="shortcut icon" href="/api/favicon.ico" />
      <link rel="stylesheet" href="/api/common.css" />
      <script src="/api/assets/js/jquery-1.10.1.min.js"></script>
      <script src="/api/assets/js/jquery.validate.min.js"></script>
      <script src="/api/assets/js/jquery.ah-placeholder.min.js"></script>
      <script src="/api/assets/js/formlayout_script.js"></script>
      </head>
      <body>
      <div id="app" data-language={this.props.language}></div>
      <script src="/api/assets/js/checkout.js"></script>
      <script src="/api/assets/js/log4js.min.js"></script>
      <script src="/api/common.js"></script>
      <script src="/api/app.bundle.js"></script>
      </body>
    </html>;
  }
}
export default Home;

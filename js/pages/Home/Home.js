import React from 'react';

class Home extends React.Component {
  render() {
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>PayPalPayment</title>
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="stylesheet" href="/common.css" />
      <script src="/assets/js/jquery-1.10.1.min.js"></script>
      <script src="/assets/js/jquery.validate.min.js"></script>
      <script src="/assets/js/jquery.ah-placeholder.min.js"></script>
      <script src="/assets/js/formlayout_script.js"></script>
      </head>
      <body>
      <div id="app" data-language={this.props.language}></div>
      <script src="/assets/js/checkout.js"></script>
      <script src="/assets/js/log4js.min.js"></script>
      <script src="/common.js"></script>
      <script src="/app.bundle.js"></script>
      </body>
    </html>;
  }
}
export default Home;

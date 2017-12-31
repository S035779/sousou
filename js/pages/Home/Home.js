import React from 'react';

class Home extends React.Component {
  render() {
      return <html>
        <head>
        <meta charSet="utf-8" />
        <title>PayPalPayment</title>
        <link rel="shortcut icon" href="/views/assets/image/favicon.ico" />
        <link rel="stylesheet" href="/views/common.css" />
        <script src="https://www.paypalobjects.com/api/checkout.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
        <script src="/views/assets/js/jquery.validate.min.js"></script>
        <script src="/views/assets/js/jquery.ah-placeholder.min.js"></script>
        <script src="/views/assets/js/jquery.exresize-latest.js"></script>
        <script src="/views/assets/js/formlayout_script.js"></script>
        <script src="/views/assets/js/log4js.min.js"></script>
        </head>
        <body>
        <div id="app" data-language={this.props.language}></div>
        <script src="/views/common.js"></script>
        <script src="/views/app.bundle.js"></script>
        </body>
      </html>;
    }
}
export default Home;

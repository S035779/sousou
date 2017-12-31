import dotenv from 'dotenv';
import React from 'react';
dotenv.config();
const ssl_host = process.env.SSR_URL || 'https://localhost:4443';

class Home extends React.Component {
  render() {
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>PayPalPayment</title>
      <link rel="shortcut icon"
        href={ssl_host + "/views/assets/image/favicon.ico"} />
      <link rel="stylesheet"
        href={ssl_host + "/views/common.css"} />
      <script
        src="https://www.paypalobjects.com/api/checkout.js">
      </script>
      <script
        src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js">
      </script>
      <script
        src={ssl_host + "/views/assets/js/jquery.validate.min.js"}>
      </script>
      <script
        src={ssl_host + "/views/assets/js/jquery.ah-placeholder.min.js"}>
      </script>
      <script
        src={ssl_host + "/views/assets/js/jquery.exresize-latest.js"}>
      </script>
      <script
        src={ssl_host + "/views/assets/js/formlayout_script.js"}>
      </script>
      <script
        src={ssl_host + "/views/assets/js/log4js.min.js"}>
      </script>
      </head>
      <body>
      <div id="app" data-language={this.props.language}></div>
      <script src={ssl_host + "/views/common.js"}></script>
      <script src={ssl_host + "/views/app.bundle.js"}></script>
      </body>
      </html>;
  }
}
export default Home;

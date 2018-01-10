import dotenv from 'dotenv';
import React from 'react';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || '';
const assets = process.env.ASSET_PATH || '';
const jquery_path = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js';

let path_to_js = ''; 
let path_to_css = '';
if (env === 'development') {
} else if (env === 'staging' || env === 'production') {
  path_to_js  = host + assets + '/js';
  path_to_css = host + assets + '/css';
}

class Credit extends React.Component {
  render() {
    const iframe_styles = {
      width: '450px', height: '450px', border: 'none', overflow: 'hidden'
    };
    const form_styles = { display: 'none' };
    const obj = JSON.parse(this.props.options);
    const contents = {
      name:        `${obj.infomation.first_name}`
                         + ` ${obj.infomation.last_name}`,
      item:        `${obj.item.name}`,
      description: `${obj.item.description}`,
      price:       `${obj.item.price} ${obj.item.currency}`,
      quantity:    `${obj.item.quantity}`,
      subtotal:    `${obj.details.subtotal} ${obj.item.currency}`,
      shipping:    `${obj.details.shipping} ${obj.currency}`,
      total:       `${obj.total} ${obj.currency}`,
      postal_code: `${obj.shipping_address.postal_code}`,
      state:       `${obj.shipping_address.state}`,
      city:        `${obj.shipping_address.city}`,
      line1:       `${obj.shipping_address.line1}`,
      line2:       `${obj.shipping_address.line2}`,
      recipient:   `${obj.shipping_address.recipient_name}`,
      phone:       `${obj.shipping_address.phone}`,
      country_code:`${obj.shipping_address.country_code}`,
      payment:     `${obj.infomation.payment}`,
      message:     `${obj.infomation.message}`,
    };
    return <html>
      <head>
      <meta charSet="utf-8" />
      <title>PayPal Payment</title>
      <link rel="shortcut icon" href={ path_to_css + "/favicon.ico" } />
      <link rel="stylesheet"    href={ path_to_css + "/style.css" } />
      <script src={ jquery_path }></script>
      </head>
      <body>
      <div className="buynow_contactlast">
      <div id="user-sign-up">
      <fieldset className="category-group">
      <legend>ご購入予定の商品</legend>
      <p>お客様は以下の商品を選択しました。</p>
      <table>
      <tbody>
      <tr><td><label> お客様：</label>
        <span>{contents.name}</span></td></tr>
      <tr><td><label> 商品名：</label>
        <span>{contents.item}</span></td></tr>
      <tr><td><label> 概　要：</label>
        <span>{contents.description}</span></td></tr>
      <tr><td><label> 単　価：</label>
        <span>{contents.price}</span></td></tr>
      <tr><td><label> 数　量：</label>
        <span>{contents.quantity}</span></td></tr>
      <tr><td><label> 小　計：</label>
        <span>{contents.subtotal}</span></td></tr>
      <tr><td><label> 配送料：</label>
        <span>{contents.shipping}</span></td></tr>
      <tr><td><label> 合　計：</label>
        <span>{contents.total}</span></td></tr>
      <tr><td><label> 配送先：</label>
        <span>{contents.postal_code}</span>
        <span>{contents.state}{contents.city}
              {contents.line1}{contents.line2}</span></td></tr>
      <tr><td><label> 受取人：</label>
        <span>{contents.recipient}</span></td></tr>
      <tr><td><label> 電　話：</label>
        <span>{contents.phone}</span></td></tr>
      <tr><td><label> 国記号：</label>
        <span>{contents.country_code}</span></td></tr>
      <tr><td><label> 方　法：</label>
        <span>{contents.payment}</span></td></tr>
      <tr><td><label> 連　絡：</label>
        <span>{contents.message}</span></td></tr>
      </tbody></table>
      </fieldset>
      <fieldset className="category-group">
      <legend>クレジットカード情報の入力</legend>
      <iframe name='hss_iframe' style={iframe_styles}></iframe>
      <form method='post' name='form_iframe' target='hss_iframe'
        style={form_styles}
        action='https://securepayments.sandbox.paypal.com/webapps/HostedSoleSolutionApp/webflow/sparta/hostedSoleSolutionProcess'>
      <input name='cmd' type='hidden' value='_hosted-payment'/>
      <input name='subtotal' type='hidden' value='1554'/>
      <input name='business' type='hidden' value='KX2RHNPRB34RN'/>
      <input name='paymentaction' type='hidden' value='sale'/>
      <input name='template' type='hidden' value='templateD'/>
      <input name='return' type='hidden'
        value='https://localhost:4443/sample_dev.html'/>
      </form>
      <script type="text/javascript">
        document.form_iframe.submit();
      </script>
      </fieldset>
      </div>
      </div>
      <script src={ path_to_js + "/creditlayout.bundle.js" }></script>
      </body>
      </html>;
  }
}
export default Credit;

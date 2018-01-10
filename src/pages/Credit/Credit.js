import dotenv from 'dotenv';
import React from 'react';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || '';
const redirect_url = process.env.REDIRECT_URL;
const canceled_url = process.env.CANCELED_URL;
const paypal_sandbox = 'https://securepayments.sandbox.paypal.com/webapps/HostedSoleSolutionApp/webflow/sparta/hostedSoleSolutionProcess';
const paypal_production = 'https://securepayments.paypal.com/webapps/HostedSoleSolutionApp/webflow/sparta/hostedSoleSolutionProcess';
const assets = process.env.ASSET_PATH || '';
const jquery_path = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js';

let path_to_js = ''; 
let path_to_css = '';
let credit_url = '';
let notify_url = '';
if (env === 'development') {
  credit_url = paypal_sandbox;
} else if (env === 'staging') {
  path_to_js  = host + assets + '/js';
  path_to_css = host + assets + '/css';
  credit_url = paypal_sandbox;
  notify_url = host + '/api';
} else if (env === 'production') {
  path_to_js  = host + assets + '/js';
  path_to_css = host + assets + '/css';
  credit_url = paypal_production;
  notify_url = host + '/api';
}

class Credit extends React.Component {
  handleButtonClick() {
    window.close();
  }
  render() {
    const iframe_styles = {
      width: '425px', height: '470px', border: 'none', overflow: 'hidden'
    };
    const form_styles = { display: 'none' };
    const obj = JSON.parse(this.props.options);
    const isJP = obj.language === 'jp' ? true : false;
    const language =  isJP ? 'JP' : 'US';
    const contents = {
      email:       { key: isJP ? '　メール： ' : '              Email : '
        , value: `${obj.infomation.email}` },
      name:        { key: isJP ? '　名　前： ' : '               Name : '
        , value: isJP
          ? `${obj.infomation.last_name} ${obj.infomation.first_name}`
          : `${obj.infomation.first_name} ${obj.infomation.last_name}`
      },
      item:        { key: isJP ? '　商品名： ' : '            Product : '
        , value: `${obj.item.name}` },
      description: { key: isJP ? '　概　要： ' : '        Description : '
        , value: `${obj.item.description}` },
      price:       { key: isJP ? '　単　価： ' : '              Price : '
        , value: `${obj.item.price} ${obj.item.currency}` },
      quantity:    { key: isJP ? '　数　量： ' : '           Quantity : '
        , value: `${obj.item.quantity}`},
      subtotal:    { key: isJP ? '　小　計： ' : '           Subtotal : '
        , value: isJP 
          ? Number(obj.details.subtotal).toLocaleString('ja-JP'
              , { style: 'currency', currency: obj.item.currency})
          : Number(obj.details.subtotal).toLocaleString('en-US'
              , { style: 'currency', currency: obj.item.currency})
      },
      shipping:    { key: isJP ? '　配送料： ' : '       Shipping fee : '
        , value: isJP
          ? Number(obj.details.shipping).toLocaleString('ja-JP'
              , { style: 'currency', currency: obj.currency})
          : Number(obj.details.shipping).toLocaleString('en-US'
              , { style: 'currency', currency: obj.currency})
      },
      total:       { key: isJP ? '　合　計： ' : '              Total : '
        , value: isJP 
          ? Number(obj.total).toLocaleString('ja-JP'
              , { style: 'currency', currency: obj.currency})
          : Number(obj.total).toLocaleString('en-US'
              , { style: 'currency', currency: obj.currency})
      },
      postal_code: { key: isJP ? '郵便番号： ' : '                Zip : '
        , value: `${obj.shipping_address.postal_code}` },
      state:       { key: isJP ? '　州　名： ' : '              State : '
        , value: `${obj.shipping_address.state}` },
      city:        { key: isJP ? '　都市名： ' : '               City : '
        , value: `${obj.shipping_address.city}` },
      line1:       { key: isJP ? '都道府県： ' : '       Municipality : '
        , value: `${obj.shipping_address.line1}` },
      line2:       { key: isJP ? '市区町村： ' : 'A lot / Room Number : '
        , value: `${obj.shipping_address.line2}` },
      recipient:   { key: isJP ? '　受取人： ' : '     Recipient Name : '
        , value: `${obj.shipping_address.recipient_name}` },
      phone:       { key: isJP ? '電話番号： ' : '              Phone : '
        , value: `${obj.shipping_address.phone}` },
      country_code:{ key: isJP ? '国コード： ' : '       Country code : '
        , value: `${obj.shipping_address.country_code}` },
      payment:     { key: isJP ? '支払方法： ' : '     Payment method : '
        , value: `${obj.infomation.payment}` },
      message:     { key: isJP ? '連絡事項： ' : '            Message : '
        , value: `${obj.infomation.message}` },
    };
    const Shipping = isJP      ? '　配送先： ' : '   Delivery address : ';
    const Confirm = isJP
      ? 'ご注文内容の確認' : 'Confirmation of your order';
    const ConfirmMessage = isJP
      ? 'お客様は以下の商品を選択しました。'
      : 'Customers selected the following items.';
    const ConfirmOrder = isJP
      ? '注文を確定する' : 'Confirm order';
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
      <legend>{Confirm}</legend>
      <p>{ConfirmMessage}</p>
      <table>
      <tbody>
      <tr><td><label>{contents.name.key}</label>
        <span>{contents.name.value}</span></td></tr>
      <tr><td><label>{contents.subtotal.key}</label>
        <span>{contents.subtotal.value}</span></td></tr>
      <tr><td><label>{contents.shipping.key}</label>
        <span>{contents.shipping.value}</span></td></tr>
      <tr><td><label>{contents.total.key}</label>
        <span>{contents.total.value}</span></td></tr>
      <tr><td><label>{Shipping}</label>
        <span>{contents.postal_code.value}</span>
        <span>{contents.state.value}{contents.city.value}
              {contents.line1.value}{contents.line2.value}
              {contents.recipient.value}</span></td></tr>
      <tr><td><label>{contents.phone.key}</label>
        <span>{contents.phone.value}</span></td></tr>
      <tr><td><label>{contents.email.key}</label>
        <span>{contents.email.value}</span></td></tr>
      </tbody></table>
      </fieldset>
      <fieldset className="category-group">
      <legend>{ConfirmOrder}</legend>
      <iframe name='hss_iframe' style={iframe_styles}></iframe>
      <form method='post' name='form_iframe' target='hss_iframe'
        style={form_styles} action={credit_url}>
      <input name='cmd' type='hidden' value='_hosted-payment'/>
      <input name='buyer_email' type='hidden'
        value={obj.infomation.email}/>
      <input name='billing_first_name' type='hidden'
        value={obj.infomation.first_name}/>
      <input name='billing_last_name' type='hidden'
        value={obj.infomation.last_name}/>
      <input name='subtotal' type='hidden'
        value={obj.details.subtotal}/>
      <input name='shipping' type='hidden'
        value={obj.details.shipping}/>
      <input name='currency_code' type='hidden'
        value={obj.currency}/>
      <input name='billing_zip' type='hidden'
        value={obj.shipping_address.postal_code}/>
      <input name='billing_state' type='hidden'
        value={obj.shipping_address.state}/>
      <input name='billing_city' type='hidden'
        value={obj.shipping_address.city}/>
      <input name='billing_address1' type='hidden'
        value={obj.shipping_address.line1}/>
      <input name='billing_address2' type='hidden'
        value={obj.shipping_address.line2}/>
      <input name='night_phone_b' type='hidden'
        value={obj.shipping_address.phone}/>
      <input name='billing_country' type='hidden'
        value={obj.shipping_address.country_code}/>
      <input name='business' type='hidden' value='KX2RHNPRB34RN'/>
      <input name='paymentaction' type='hidden' value='sale'/>
      <input name='template' type='hidden' value='templateD'/>
      <input name='return' type='hidden' value={redirect_url}/>
      <input name='cancel_return' type='hidden' value={canceled_url}/>
      <input name='notify_url' type='hidden' value={notify_url}/>
      <input name='lc' type='hidden' value={language}/>
      </form>
      <script type="text/javascript">
        document.form_iframe.submit();
      </script>
      </fieldset>
      <div id="signup-next">
        <input type="submit" value="SEND" 
          onClick={this.handleButtonClick.bind(this)}
          className="button-primary"/>
      </div>
      </div>
      </div>
      <script src={ path_to_js + "/creditlayout.bundle.js" }></script>
      </body>
      </html>;
  }
}
export default Credit;

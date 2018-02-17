import React from 'react';
import AppAction from '../../actions/AppAction'
import std from '../../utils/stdutils';
import { log } from '../../utils/webutils';

const receiver_email = process.env.PAYPAL_ID;
const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL || '';
const notify_url = host + '/api/payment/notify';
const redirect_url = process.env.REDIRECT_URL;
const canceled_url = process.env.CANCELED_URL;
const paypal_sandbox = 'https://securepayments.sandbox.paypal.com/webapps/HostedSoleSolutionApp/webflow/sparta/hostedSoleSolutionProcess';
const paypal_production = 'https://securepayments.paypal.com/webapps/HostedSoleSolutionApp/webflow/sparta/hostedSoleSolutionProcess';

let credit_url = '';
if (env === 'development') {
  credit_url = paypal_sandbox;
} else if (env === 'staging') {
  credit_url = paypal_sandbox;
} else if (env === 'production') {
  credit_url = paypal_production;
}

const pspid = 'CreditView';

class Credit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      custom: std.formatDate(new Date(), 'yyMMdd01ccc')
      , receiver_email: receiver_email
      , mc_gross: props.options.total
      , mc_currency: props.options.currency
    };
  }

  componentDidMount() {
    window.form_iframe.submit();
    AppAction.createCredit(Object.assign({}, this.props.options
      , { credit_validate: this.state }));
  }

  handleClickClose(e) {
    //this.logInfo('handleClickClose');
    if(this.isConfirm()) this.props.onCompleted();
  }

  handleClickButton(e) {
    //this.logInfo('handleClickButton');
    if(this.isConfirm()) this.props.onCompleted();
  }

  isConfirm() {
    const message = this.isLangJp() 
      ? 'このページから移動してもよろしですか？'
      : 'Are you sure to move from this page?';
    return window.confirm(message);
  }

  isLangJp() {
    return this.props.language === 'jp';
  }
  
  setPrices(obj, isLangJp) {
    const item_currency = obj.item.currency; 
    const total_currency = obj.currency;
    return {
      subtotal_price: this.item_currency !== ''
        ? isLangJp
          ? Number(obj.details.subtotal).toLocaleString('ja-JP'
            , { style: 'currency', currency: item_currency})
          : Number(obj.details.subtotal).toLocaleString('en-US'
            , { style: 'currency', currency: item_currency})
        : 0
      , shipping_price: this.total_currency !== ''
        ? isLangJp
          ? Number(obj.details.shipping).toLocaleString('ja-JP'
            , { style: 'currency', currency: total_currency})
          : Number(obj.details.shipping).toLocaleString('en-US'
            , { style: 'currency', currency: total_currency})
        : 0
      , discount_price: this.total_currency !== ''
        ? isLangJp
          ? Number(obj.details.shipping_discount).toLocaleString('ja-JP'
            , { style: 'currency', currency: total_currency})
          : Number(obj.details.shipping_discount).toLocaleString('en-US'
            , { style: 'currency', currency: total_currency})
        : 0
      , total_shipping_price: this.total_currency !== ''
        ? isLangJp
          ? (obj.details.shipping + obj.details.shipping_discount)
            .toLocaleString('ja-JP'
              , { style: 'currency', currency: total_currency})
          : (obj.details.shipping + obj.details.shipping_discount)
            .toLocaleString('en-US'
              , { style: 'currency', currency: total_currency})
        : 0
      , total_price: this.total_currency !== ''
        ? isLangJp 
          ? Number(obj.total).toLocaleString('ja-JP'
            , { style: 'currency', currency: total_currency})
          : Number(obj.total).toLocaleString('en-US'
            , { style: 'currency', currency: total_currency})
        : 0
    };
  }

  setContents(obj, isLangJp) {
    const prices = this.setPrices(obj, isLangJp);
    return {
      item: {
        key: isLangJp ? '商品名　： ' : 'Product : '
        , value: obj.item.name
      }
      , name: {
        key: isLangJp ? '名　前　： ' : 'Name : '
        , value: obj.infomation.name
      }
      , company: {
        key: isLangJp ? '会　社　： ' : 'Company : '
        , value: obj.infomation.company
      }
      , subtotal: {
        key: isLangJp ? '小　計　： ' : 'Subtotal : '
        , value: prices.subtotal_price
      }
      , shipping: {
        key: isLangJp ? '配送料　： ' : 'Shipping fee : '
        //, value: prices.shipping_price
        , value: prices.total_shipping_price
      }
      //, discount: {
      //  key: isLangJp ? '値引き　： ' : 'Discount : '
      //  , value: prices.discount_price
      //}
      , total: {
        key: isLangJp ? '合　計　： ' : 'Total : '
        , value: prices.total_price
      }
      , postal_code: {
        key: isLangJp ? '郵便番号： ' : 'Zip : '
        , value: obj.infomation.postal_code
          ? obj.infomation.postal_code : ''
      }
      , country: {
        key: isLangJp ? '国　名　： ' : 'Country : '
        , value: obj.infomation.country
          ? obj.infomation.country : ''
      }
      , address1: {
        key: isLangJp ? '住　所　： ' : 'Address : '
        , value: obj.infomation.address1
      }
      , address2: {
        key: isLangJp ? '番　地　： ' : 'A lot number : '
        , value: obj.infomation.address2
          ? obj.infomation.address2 : ''
      }
      , recipient_name: {
        key: isLangJp ? '受取人名： ' : 'Name : '
        , value: obj.infomation.recipient_name 
          ? obj.infomation.recipient_name : ''
      }
      , recipient_phone: {
        key: isLangJp ? '電話番号： ' : 'Phone : '
        , value: obj.infomation.recipient_phone
      }
      , email: {
        key: isLangJp ? 'メール　： ' : 'Email : '
        , value: obj.infomation.email
      }
    };
  }

  logInfo(message) {
    log.info(`${pspid}>`, 'Request:', message);
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Response:', message);
  }

  logError(error) {
    log.error(`${pspid}>`, error.name, error.message);
  }

  render() {
    const form_styles = { display: 'none' };
    const obj = this.props.options;
    const isLangJp = this.isLangJp();
    const contents = this.setContents(obj, isLangJp);
    const Shipping = isLangJp ? '配送先　： ' : 'Address       : ';
    const Confirm = isLangJp
      ? 'ご注文内容の確認' : 'Confirmation of your order';
    const ConfirmOrder = isLangJp ? 'お支払' : 'Payment';
    const language =  isLangJp ? 'JP' : 'US';
    const custom = this.state.custom;
    const receiver = this.state.receiver_email
    return <div className="buynow_contactlast">
      <a href="#" className="close-thik"
        onClick={this.handleClickClose.bind(this)}></a>
      <div id="user-sign-up">
      <fieldset className="category-group item-group">
      <legend>{Confirm}</legend>
      <table>
      <tbody>
      <tr>
        <th className="key"></th>
        <th className="value"></th>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.item.key}</label></td>
        <td><span>{contents.item.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.subtotal.key}</label></td>
        <td><span>{contents.subtotal.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.shipping.key}</label></td>
        <td><span>{contents.shipping.value}</span></td>
      </tr>
      {/*
      <tr>
        <td className="item_name"><label>{contents.discount.key}</label></td>
        <td><span>{contents.discount.value}</span></td>
      </tr>
      */}
      <tr>
        <td className="item_name"><label>{contents.total.key}</label></td>
        <td><span>{contents.total.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.company.key}</label></td>
        <td><span>{contents.company.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.name.key}</label></td>
        <td><span>{contents.name.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{Shipping}</label></td>
        <td><span>{contents.postal_code.value}</span>
        <span>{contents.country.value}</span>
        <span>{contents.address1.value}</span>
        <span>{contents.address2.value}</span>
        <span>{contents.recipient_name.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.recipient_phone.key}</label></td>
        <td><span>{contents.recipient_phone.value}</span></td>
      </tr>
      <tr>
        <td className="item_name"><label>{contents.email.key}</label></td>
        <td><span>{contents.email.value}</span></td>
      </tr>
      </tbody></table>
      </fieldset>
      <fieldset className="category-group">
      <legend>{ConfirmOrder}</legend>
      <iframe name='hss_iframe' style={styles.iframe}></iframe>
      <form method='post' name='form_iframe' target='hss_iframe'
        style={form_styles} action={credit_url}>
      <input name='cmd' type='hidden' value='_hosted-payment'/>
      <input name='buyer_email' type='hidden'
        value={obj.infomation.email}/>
      <input name='billing_first_name' type='hidden'
        value={obj.infomation.name}/>
      <input name='billing_last_name' type='hidden'
        value={'.'}/>
      <input name='subtotal' type='hidden'
        value={obj.details.subtotal}/>
      <input name='shipping' type='hidden'
        value={obj.details.shipping + obj.details.shipping_discount}/>
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
        value={obj.shipping_address.country_code.join()}/>
      <input name='business' type='hidden' value={receiver}/>
      <input name='paymentaction' type='hidden' value='sale'/>
      <input name='template' type='hidden' value='mobile-iframe'/>
      <input name='return' type='hidden' value={redirect_url}/>
      <input name='cancel_return' type='hidden' value={canceled_url}/>
      <input name='notify_url' type='hidden' value={notify_url}/>
      <input name='lc' type='hidden' value={language}/>
      <input name='custom' type='hidden' value={custom}/>
      </form>
      </fieldset>
      <div id="signup-next">
      <input type="submit" value={ isLangJp ? "戻る" : "RETURN"}
        onClick={this.handleClickButton.bind(this)}
        className="button-primary"/>
      </div>
      </div>
      </div>;
  }
}

const styles = {
  iframe: {
    width: '100%'
    //, height: '565px'
    //, margin: '0 0 0 10px'
    , height: '426px'
    , border: 'none'
    , overflow: 'auto'
  },
};
export default Credit;

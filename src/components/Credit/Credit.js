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
      , mc_currency: props.options.currency.join()
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
    const item_currency = obj.item.currency.join() !== '' 
      ? obj.item.currency : ''
    const total_currency = obj.currency.join() !== ''
        ? obj.currency : ''
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
      email: {
        key: isLangJp ? 'メール　： ' : 'Email        : '
        , value: `${obj.infomation.email}`                              },
      name: {
        key: isLangJp ? '名　前　： ' : 'Name         : '
        , value:
          `${obj.infomation.first_name} ${obj.infomation.last_name}`    },
      company: {
        key: isLangJp ? '会　社　： ' : 'Company      : '
        , value: `${obj.infomation.company}`                            },
      item: {
        key: isLangJp ? '商品名　： ' : 'Product      : '
        , value: `${obj.item.name}`                                     },
      description: {
        key: isLangJp ? '概　要　： ' : 'Description  : '
        , value: `${obj.item.description}`                              },
      price: {
        key: isLangJp ? '単　価　： ' : 'Price        : '
        , value: `${obj.item.price} ${prices.item_currency}`            },
      quantity: {
        key: isLangJp ? '数　量　： ' : 'Quantity     : '
        , value: `${obj.item.quantity}`                                 },
      subtotal: {
        key: isLangJp ? '小　計　： ' : 'Subtotal     : '
        , value: prices.subtotal_price                                  },
      shipping: {
        key: isLangJp ? '配送料　： ' : 'Shipping fee : '
        , value: prices.shipping_price                                  },
      discount: {
        key: isLangJp ? '値引き　： ' : 'Discount     : '
        , value: prices.discount_price                                  },
      total: {
        key: isLangJp ? '合　計　： ' : 'Total        : '
        , value: prices.total_price                                     },
      postal_code: {
        key: isLangJp ? '郵便番号： ' : 'Zip          : '
        , value: `${obj.shipping_address.postal_code}`                  },
      state: {
        key: isLangJp ? '都道府県： ' : 'State        : '
        , value: `${obj.shipping_address.state}`                        },
      city: {
        key: isLangJp ? '市区町村： ' : 'City         : '
        , value: `${obj.shipping_address.city}`                         },
      //line1: {
      //  key: isLangJp ? '地　域　： ' : 'Municipality : '
      //  , value: `${obj.shipping_address.line1}`                        },
      //line2: {
      //  key: isLangJp ? '番地番号： ' : 'A lot Number : '
      //  , value: `${obj.shipping_address.line2}`                        },
      //recipient: {
      //  key: isLangJp ? '受取人　： ' : 'Recipient    : '
      //  , value: `${obj.shipping_address.recipient_name}`               },
      phone: {
        key: isLangJp ? '電　話　： ' : 'Phone        : '
        , value: `${obj.shipping_address.phone}`                        },
      country_code: {
        key: isLangJp ? '国コード： ' : 'Country code : '
        , value: `${obj.shipping_address.country_code}`                 },
      payment: {
        key: isLangJp ? '支払方法： ' : 'Method       : '
        , value: `${obj.infomation.payment}`                            },
      message: {
        key: isLangJp ? '連絡事項： ' : 'Message      : '
        , value: `${obj.infomation.message}`                            },
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
    //console.log(this.state);
    const form_styles = { display: 'none' };
    const obj = this.props.options;
    const isLangJp = this.isLangJp();
    const contents = this.setContents(obj, isLangJp);
    const Shipping = isLangJp
      ? '配送先　： ' : 'Address       : ';
    const Confirm = isLangJp
      ? 'ご注文内容の確認' : 'Confirmation of your order';
    //const ConfirmMessage = isLangJp
    //  ? 'お客様は以下の商品を選択しました。'
    //  : 'Customers selected the following items.';
    const ConfirmOrder = isLangJp ? 'お支払' : 'Payment';
    const language =  isLangJp ? 'JP' : 'US';
    const custom = this.state.custom;
    const receiver = this.state.receiver_email
    return <div className="buynow_contactlast">
      <a href="#" className="close-thik"
        onClick={this.handleClickClose.bind(this)}></a>
      <div id="user-sign-up">
      <fieldset className="category-group confirm">
      <legend>{Confirm}</legend>
      {/*
      <p>{ConfirmMessage}</p>
      */}
      <table>
      <tbody>
      <tr>
        <td><label>{contents.item.key}</label>
        <span>{contents.item.value}</span></td>
      </tr>
      {/*
      <tr>
        <td><label>{contents.description.key}</label>
        <span>{contents.description.value}</span></td>
      </tr>
      */}
      <tr>
        <td><label>{contents.subtotal.key}</label>
        <span>{contents.subtotal.value}</span></td>
      </tr>
      <tr>
        <td><label>{contents.shipping.key}</label>
        <span>{contents.shipping.value}</span></td>
      </tr>
      <tr>
        <td><label>{contents.discount.key}</label>
        <span>{contents.discount.value}</span></td>
      </tr>
      <tr>
        <td><label>{contents.total.key}</label>
        <span>{contents.total.value}</span></td>
      </tr>
      <tr>
        <td><label>{contents.company.key}</label>
        <span>{contents.company.value}</span></td>
      </tr>
      <tr>
        <td><label>{contents.name.key}</label>
        <span>{contents.name.value}</span></td>
      </tr>
      <tr>
        <td><label>{Shipping}</label>
        <span>{contents.postal_code.value}</span>
        <span>
          {contents.state.value}{contents.city.value}
          {/*contents.line1.value*/}
          {/*contents.line2.value}{contents.recipient.value*/}
        </span></td>
      </tr>
      <tr>
        <td><label>{contents.phone.key}</label>
        <span>{contents.phone.value}</span></td>
      </tr>
      <tr>
        <td><label>{contents.email.key}</label>
        <span>{contents.email.value}</span></td>
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
        value={obj.infomation.first_name}/>
      <input name='billing_last_name' type='hidden'
        value={obj.infomation.last_name}/>
      <input name='subtotal' type='hidden'
        value={obj.details.subtotal}/>
      <input name='shipping' type='hidden'
        value={obj.details.shipping + obj.details.shipping_discount}/>
      <input name='currency_code' type='hidden'
        value={obj.currency.join()}/>
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

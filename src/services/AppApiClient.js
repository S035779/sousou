import std from 'Utilities/stdutils';
import xhr from 'Utilities/xhrutils';
import { log } from 'Utilities/webutils';

const env = process.env.NODE_ENV || 'development';
const productions_access_key = process.env.PAYPAL_ACCESS_KEY;
const development_access_key = process.env.PAYPAL_ACCESS_KEY;
const sender = process.env.MMS_FROM;
const host = process.env.TOP_URL;
const api_path = process.env.API_PATH;
const api = host + api_path;
const pspid = 'AppApiClient';

let paypal_env = '';
if (env === 'development') {
  paypal_env = 'sandbox';
  log.config('console', 'basic', 'webpay-renderer', 'TRACE');
} else if (env === 'staging') {
  paypal_env = 'sandbox';
  log.config('console', 'basic', 'webpay-renderer', 'DEBUG');
} else if (env === 'production') {
  paypal_env = 'production';
  log.config('console', 'json', 'webpay-renderer', 'INFO');
}
log.info(`${pspid}>`, 'Paypal Environment:', paypal_env);
log.info(`${pspid}>`, 'Paypal Payment URI:', api);

export default {
  request(operation, options) {
    const uri = api + operation;
    switch(operation) {
      case '/credit':
        return new Promise((resolve, reject) => {
            resolve();
          });
      case '/payment':
        return new Promise((resolve, reject) => {
          paypal.Button.render({
            env: paypal_env
            , locale: 'ja_JP'
            , commit: true
            , style: {
              size:     'responsive' 
              , color:  'gold'
              , shape:  'rect'
              , label:  'paypal'
            }
            , client: {
              sandbox:    productions_access_key,
              production: development_access_key
            }
            , payment: function(data, actions) {
              return actions.payment.create({
                payment: { transactions: [{
                  amount: {
                    total:            options.total
                    , currency:       options.currency
                    , details:        options.details
                  },
                  item_list: {
                    items:            [options.item],
                    shipping_address: options.shipping_address
                  }
                }]}
              });
            }
            , onAuthorize: function(data, actions) {
              return actions.payment.execute()
                .then(payment => {
                  resolve(payment);
                });
            }
            , onCancel: function() {
              reject(new Error('Buyer cancelled the payment.'));
            }
            , onError: function(err) {
              reject(err);
            }
          }, '#paypal-button');
        });
      case '/payment_':
        return new Promise((resolve, reject) => {
          paypal.Button.render({
            env: paypal_env
            , locale: 'ja_JP'
            , commit: true
            , style: {
              size:     'responsive' 
              , color:  'gold'
              , shape:  'rect'
              , label:  'paypal'
            }
            , payment: function() {
              return paypal.request.post(uri + '/create-payment')
                .then(res => res.id);
            }
            , onAuthorize: function(data) {
              return paypal.request.post(uri + '/execute-payment'
                , { paymentID: data.paymentID, payerID: data.payerID })
                .then(payment => {
                  resolve(payment)
              });
            }
            , onCancel: function() {
              reject(new Error('Buyer cancelled the payment.'));
            }
            , onError: function(err) {
              reject(err);
            }
          }, '#paypal-button');
        });
      case '/sendmail':
        return new Promise((resolve, reject) => {
          xhr.postJSON(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      case '/shipping':
        return new Promise((resolve, reject) => {
          xhr.get(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      case '/currency':
        return new Promise((resolve, reject) => {
          xhr.get(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      default:
        return new Promise((resolve, reject) => {
            reject(new Error('Unknown Operation.'));
          });
    }
  },
  postCredit(options) {
    return this.request('/credit', options);
  },
  postPayment(options) {
    return this.request('/payment', options);
  },
  postMessage(options) {
    return this.request('/sendmail', options);
  },
  getShipping(options) {
    return this.request('/shipping', options);
  },
  getCurrency(options) {
    return this.request('/currency', options);
  },
  createCredit(params) {
    const options = this.validate(params);
    const buyer = this.setCustomer(options);
    const seler  = this.setManager(options);
    return this.postCredit(options)
      .then(() => this.postMessage(seler))
      .then(() => this.postMessage(buyer))
  },
  createPayment(params) {
    const options = this.validate(params);
    const buyer = this.setCustomer(options);
    const seler  = this.setManager(options);
    return this.postPayment(options)
      .then(() => this.postMessage(seler))
      .then(() => this.postMessage(buyer))
  },
  createMessage(params) {
    const options = this.validate(params);
    const buyer = this.setCustomer(options);
    const seler  = this.setManager(options);
    return this.postMessage(seler)
      .then(() => this.postMessage(buyer))
  },
  fetchShipping(options) {
    return this.getShipping(options)
  },
  fetchCurrency(options) {
    return this.getCurrency(options)
  },
  validate(params) {
    const { currency, item, shipping_address, infomation } = params;
    let newItem = {};
    let newAddr = {};
    let newInfo = {};
    const newCurrency = Array.isArray(currency)
      ? currency.join()
      : currency;
    newItem['quantity'] = Array.isArray(item.quantity)
      ? item.quantity.join()
      : item.quantity;
    newItem['currency'] = Array.isArray(item.currency)
      ? item.currency.join()
      : item.currency;
    newAddr['country_code'] = Array.isArray(shipping_address.country_code)
      ? shipping_address.country_code.join()
      : shipping_address.country_code;
    newInfo['month'] = Array.isArray(infomation.month)
      ? infomation.month.join()
      : infomation.month;
    newInfo['payment'] = Array.isArray(infomation.payment)
      ? infomation.payment.join()
      : infomation.payment;
    return Object.assign({}, params, {
      currency: newCurrency
      , item: Object.assign({},item, newItem)
      , shipping_address: Object.assign({}, shipping_address, newAddr)
      , infomation: Object.assign({}, infomation, newInfo)
    });
  },
  setManager(obj) {
    const message = {
      from: sender
      , to: sender
      , subject: '購入を受付ました。'
      , text: `お客様は以下の商品を購入しました。\n\n`
        + ` お客様：${obj.infomation.last_name}`
          + ` ${obj.infomation.first_name}\n`
        + ` 商品名：${obj.item.name}\n`
        + ` 概　要：${obj.item.description}\n`
        + ` 単　価：${obj.item.price} ${obj.item.currency}\n`
        + ` 数　量：${obj.item.quantity}\n`
        + ` 小　計：${obj.details.subtotal} ${obj.item.currency}\n`
        + ` 配送料：${obj.details.shipping} ${obj.currency}\n`
        + ` 合　計：${obj.total} ${obj.currency}\n`
        + ` 配送先：${obj.shipping_address.postal_code}\n`
        + `         ${obj.shipping_address.state}\n`
        + `         ${obj.shipping_address.city}\n`
        + `         ${obj.shipping_address.line1}\n`
        + `         ${obj.shipping_address.line2}\n`
        + `         ${obj.shipping_address.recipient_name}\n`
        + `         ${obj.shipping_address.phone}\n`
        + `         ${obj.shipping_address.country_code}\n\n`
        + ` 方　法：${obj.infomation.payment}\n`
        + ` 連　絡：${obj.infomation.message}\n`
        + `銀行振込(deposit）、その他(other)の場合は、\n`
        + `以降、お客様対応をお願いします。\n`
    };
    return { message };
  },
  setCustomer(obj) {
    const message = {
      from: sender
      , to: obj.infomation.email
      , subject: 'ご購入有難うございました。'
      , text: `お客様は以下の商品を購入しました。\n\n`
        + ` お客様：${obj.infomation.last_name}`
          + ` ${obj.infomation.first_name}\n`
        + ` 商品名：${obj.item.name}\n`
        + ` 概　要：${obj.item.description}\n`
        + ` 単　価：${obj.item.price} ${obj.item.currency}\n`
        + ` 数　量：${obj.item.quantity}\n`
        + ` 小　計：${obj.details.subtotal} ${obj.item.currency}\n`
        + ` 配送料：${obj.details.shipping} ${obj.currency}\n`
        + ` 合　計：${obj.total} ${obj.currency}\n`
        + ` 配送先：${obj.shipping_address.postal_code}\n`
        + `         ${obj.shipping_address.state}\n`
        + `         ${obj.shipping_address.city}\n`
        + `         ${obj.shipping_address.line1}\n`
        + `         ${obj.shipping_address.line2}\n`
        + `         ${obj.shipping_address.recipient_name}\n`
        + `         ${obj.shipping_address.phone}\n`
        + `         ${obj.shipping_address.country_code}\n\n`
        + ` 方　法：${obj.infomation.payment}\n`
        + ` 連　絡：${obj.infomation.message}\n`
        + `銀行振込(deposit）、その他(other)の場合は、\n`
        + `以降の手続きは、メールにてご対応させて頂きます。\n`
        + `弊社担当からの連絡をお待ち下さい。\n`
    };
    return { message };
  },
  logInfo(request) {
    log.info(`${pspid}>`, 'Request:', request);
  },
  logTrace(response) {
    log.trace(`${pspid}>`, 'Response:', response);
  },
  logError(error) {
    log.error(`${pspid}>`, error.name, error.message);
  },
}

import xhr from '../utils/xhrutils';
import { log } from '../utils/webutils';

const env = process.env.NODE_ENV || 'development';
if (env === 'development') 
  log.config('alert', 'basic', 'webpay-renderer', 'TRACE');
if (env === 'staging') 
  log.config('console', 'basic', 'webpay-renderer', 'DEBUG');
if (env === 'production') 
  log.config('console', 'json', 'webpay-renderer', 'INFO');

const pspid = 'AppApiClient';

const productions_access_key = process.env.PAYPAL_ACCESS_KEY;
const development_access_key = process.env.PAYPAL_ACCESS_KEY;
const sender = process.env.MMS_FROM;

const path = '/api';

export default {
  request(operation, options) {
    const uri = path + operation;
    switch(operation) {
      case '/payment':
        return new Promise((resolve, reject) => {
          paypal.Button.render({
            env: 'sandbox'
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
            env: 'sandbox'
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
  createPayment(options) {
    const buyer = this.setCustomer(options);
    const seler  = this.setManager(options);
    return this.postPayment(options)
      .then(() => this.postMessage(seler))
      .then(() => this.postMessage(buyer))
      .catch(this.logError);
  },
  createMessage(options) {
    const buyer = this.setCustomer(options);
    const seler  = this.setManager(options);
    return this.postMessage(seler)
      .then(() => this.postMessage(buyer))
      .catch(this.logError);
  },
  fetchShipping(options) {
    return this.getShipping(options)
      .catch(this.logError);
  },
  fetchCurrency(options) {
    return this.getCurrency(options)
      .catch(this.logError);
  },
  setManager(obj) {
    const message = {
      from: sender
      , to: sender
      , subject: '購入を受付ました。'
      , text: `お客様は以下の商品を購入しました。\n\n`
        + ` お客様：${obj.infomation.first_name}`
          + ` ${obj.infomation.last_name}\n`
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
        + ` お客様：${obj.infomation.first_name}`
          + ` ${obj.infomation.last_name}\n`
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
        + `銀行振込(deposit）、その他(other)の場合は、\n`
        + `以降、メールにてご連絡差し上げます。\n`
        + `ご利用有難うございました。\n`
    };
    return { message };
  },
  logTrace(message) {
    log.trace(`${pspid}>`, 'Response:', message)
  },
  logError(err) {
    log.error(`${pspid}>`, err.name, err.message)
  },
}

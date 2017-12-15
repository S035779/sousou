import xhr from '../utils/xhrutils';
import { M, log } from '../utils/webutils';

log.config('console', 'basic', 'ALL', 'webpay-renderer');

const pspid = 'AppApiClient';
const path = '/api';

const productions_access_key = process.env.PAYPAL_ACCESS_KEY;
const development_access_key = process.env.PAYPAL_ACCESS_KEY;

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
              resolve('Buyer cancelled the payment.');
            }
            , onError: function(err) {
              reject(err.message);
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
              resolve('Buyer cancelled the payment.');
            }
            , onError: function(err) {
              reject(err.message);
            }
          }, '#paypal-button');
        });
      case '/shipping':
        return new Promise((resolve, reject) => {
          xhr.get(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err.message);});
          });
      case '/currency':
        return new Promise((resolve, reject) => {
          xhr.get(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err.message);});
          });
      default:
        return new Promise((resolve, reject) => {
            reject('Unknown Operation.');
          });
    }
  },
  getPayment(options) {
    return this.request('/payment', options);
  },
  getShipping(options) {
    return this.request('/shipping', options);
  },
  getCurrency(options) {
    return this.request('/currency', options);
  },
  fetchPayment(options) {
    return this.getPayment(options)
      //.then(R.tap(this.logTrace.bind(this)))
      .catch(this.logError);
  },
  fetchShipping(options) {
    return this.getShipping(options)
      //.then(R.tap(this.logTrace.bind(this)))
      .catch(this.logError);
  },
  fetchCurrency(options) {
    return this.getCurrency(options)
      .then(R.tap(this.logTrace.bind(this)))
      .catch(this.logError);
  },
  logTrace(message) {
    log.trace(`${pspid}>`, 'Response:', message)
  },
  logError(message) {
    log.error(`${pspid}>`, 'Error   :', message)
  },
}

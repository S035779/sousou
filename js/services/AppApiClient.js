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
                payment: { transactions: [
                  { amount:
                    { total: '30.11', currency: 'USD', details: {
                      subtotal:           "30.00",
                      tax:                "0.07",
                      shipping:           "0.03",
                      handling_fee:       "1.00",
                      shipping_discount:  "-1.00",
                      insurance:          "0.01"  } },
                    item_list: {
                      items: [
                        {
                          name: "商品名",
                          description: "商品概要",
                          quantity: "1",
                          price: "30.00",
                          tax: "0.07",
                          sku: "商品コード",
                          currency: "USD"
                        },
                      ],
                      shipping_address: {
                        recipient_name: "名前",
                        line1: "部屋番号・階層",
                        line2: "建物名",
                        city: "市区町村",
                        country_code: "JP",
                        postal_code: "134-0083",
                        phone: "+81-090-0000-0000",
                        state: "都道府県"
                      }
                    }
                  }
                ]}
              });
            }
            , onAuthorize: function(data, actions) {
              return actions.payment.execute()
                .then(payment => {
                  resolve(payment);
                });
            }
            , onCancel: function() {
              resolve({message: 'Buyer cancelled the payment.'});
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
              resolve({message: 'Buyer cancelled the payment.'});
            }
            , onError: function(err) {
              reject(err.message);
            }
          }, '#paypal-button');
        });
      default:
        return new Promise((resolve, reject) => {
          reject({message: 'Unknown Operation.'});
        });
    }
  },
  getPayment(options) {
    return this.request('/payment', options);
  },
  getCurrency(options) {
    return this.request('/currency', options);
  },
  fetchPayment(options) {
    return this.getPayment(options)
      .then(R.tap(this.logTrace.bind(this)))
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

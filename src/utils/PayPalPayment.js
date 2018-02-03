import dotenv from 'dotenv';
import R from 'ramda';
import Rx from 'rx';
import std from './stdutils';
import net from './netutils';
import { logs as log } from './logutils';

dotenv.config();
const env          = process.env.NODE_ENV || 'development';
const redirect_url = process.env.REDIRECT_URL;
const canceled_url = process.env.CANCELED_URL;
const pay_live    = 'https://api.paypal.com';
const pay_sandbox = 'https://api.sandbox.paypal.com';
const ipn_live    = 'https://ipnpb.paypal.com/cgi-bin/webscr';
const ipn_sandbox = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';

let pay_api = '';
let ipn_api = '';
if(env === 'development') {
  pay_api = pay_sandbox;
  ipn_api = ipn_sandbox;
} else if(env === 'staging') {
  pay_api = pay_sandbox;
  ipn_api = ipn_sandbox;
} else if(env === 'production') {
  pay_api = pay_live;
  ipn_api = ipn_live;
}
const pspid = 'paypal-api';
let cache = {
  store: {},
  maxAge:     5400 * 1000,  // 1.5 hour
  cleanAfter: 7200 * 1000,  // 2.0 hour
  cleanedAt:  0,            // cleaned at this time.
  clean: function(now) {
    if(now - this.cleanAfter > this.cleanedAt) {
      this.cleanedAt = now;
      const that = this;
      Object.keys(this.store).forEach( id => {
        if(now > that.store[id].timestamp + that.maxAge) {
          delete that.store[id];
        }
      });
    }
  }
};

/**
 * PayPalPayment Api Client class.
 *
 * @constructor
 * @param {string} access_key - The access key for this application.
 * @param {string} secret_key - The secret key for this application.
 * @param {string} token - The access token for this application.
 */
class PayPalPayment {
  constructor(access_key, secret_key) {
    this.access_key = access_key;
    this.secret_key = secret_key;
  }

  static of({ access_key, secret_key }) {
    return new PayPalPayment(access_key, secret_key);
  }

  request(operation, { query, auth, body }) {
    cache.clean(Date.now());
    switch(operation) {
      case '/cache':
        return new Promise((resolve, reject) => {
          if(!body) reject(new Error('UNKNOWN'));
          cache.store[body.credit_validate.custom]
            = { content: body, timestamp: Date.now() };
          resolve(body.credit_validate.custom);
          //std.invoke2(
          //  ( ) => cache.store[body] ? true : false,
          //  val => log.trace(val),
          //  err => reject(err),
          //  ( ) => resolve(cache.store[body].content),
          //  1000, 1000, 110 * 1000 // Time out in 110 sec.
          //);
        });
      case '/ipnpb':
        return new Promise((resolve, reject) => {
          net.post2(ipn_api
            , null, body, (err, head, data) => {
            if(err) reject(err);
            resolve(data);
          });
        });
      case '/v1/oauth2/token':
        return new Promise((resolve, reject) => {
          net.postData2(pay_api + operation
            , auth, body, (err, head, data) => {
            if(err) reject(err);
            resolve(JSON.parse(data));
          });
        });
      case '/v1/payments/payment':
        return new Promise((resolve, reject) => {
          net.postJson2(pay_api + operation
            , auth, body, (err, head, data) => {
            if(err) reject(err);
            resolve(JSON.parse(data));
          });
        });
      default:
        return new Promise((resolve, reject) => {
          net.postJson2(pay_api + operation
            , auth, body, (err, head, data) => {
            if(err) reject(err);
            resolve(JSON.parse(data));
          });
        });
    }
  }

  getToken() {
    const options = { 
      auth:   { user: this.access_key, pass: this.secret_key }
      , body: { grant_type: 'client_credentials' }
    };
    return this.request('/v1/oauth2/token', options);
  }

  putExpress(token, paymentID, payerID) {
    const options = {
      auth:   { bearer:   token }
      , body: { payer_id: payerID }
      , json: true
    };
    return this.request(
      `/v1/payments/payment/${paymentID}/execute`, options);
  }

  getExpress(token) {
    const options = {
      auth: { bearer: token }
      , body: {
        intent: 'sale'
        , payer: { payment_method: 'paypal' }
        , transactions: [
          { amount: { total: '0.01', currency: 'USD' } }
        ]
        , redirect_urls: {
          return_url:   redirect_url
          , cancel_url: canceled_url
        }
      }
    };
    return this.request('/v1/payments/payment', options);
  }

  getNotify(ipnpb) {
    const options = {
      body: Object.assign({}, { cmd: '_notify-validate' }, ipnpb)
    };
    return this.request('/ipnpb', options);
  }

  fetchToken() {
    return Rx.Observable.fromPromise(this.getToken());
  }

  fetchNotify(ipnpb) {
    return Rx.Observable.fromPromise(this.getNotify(ipnpb));
  }

  //getCache(custom) {
  //  const options = {
  //    body: custom
  //  };
  //  return this.request('/cache', options);
  //}
  //fetchCache(custom) {
  //  return Rx.Observable.fromPromise(this.getCache(custom));
  //}
  //validateCredit({ custom, receiver_email, mc_gross, mc_currency }) {
  //  const validate = R.curry(this.isCredit);
  //  return this.fetchCache(custom)
  //  .map(validate(receiver_email, mc_gross, mc_currency));
  //}

  putCache(data) {
    const options = { body: data };
    return this.request('/cache', options)
  }

  postCache(data) {
    return Rx.Observable.fromPromise(this.putCache(data));
  }

  validateCredit(data) {
    return this.postCache(data)
      .map(custom => cache.store[custom].content.credit_validate);
  }

  validateNotify(ipnpb) {
    const isNotify = R.curry(this.isNotify);
    const isCredit = R.curry(this.isCredit);
    return this.fetchNotify(ipnpb)
      .map(isNotify(ipnpb))
      .map(isCredit(ipnpb))
      .map(data => [ data.buyer.message, data.seler.message ]);
  }

  isNotify(ipnpb, data) {
    //log.info('Custom', ipnpb.custom);
    //log.info('Content:', cache);
    //log.info('Response:', data);   
    let result = {};
    const isComplete = ipnpb.payment_status === 'Completed';
    switch(data) {
      case 'VERIFIED':
        if(isComplete) {
          log.info('Verified IPN: IPN message for Transaction ID:'
            , ipnpb.txn_id, 'is verified.');
          if(!cache.store[ipnpb.custom]) {
            if(ipnpb.txn_type === 'pro_hosted') {
              log.info('Request is PayPal PaymentPro.'
                , 'Transaction ID:', ipnpb.txn_id); 
              throw new Error('UNREGISTERED');
            } else
            if(ipnpb.txn_type === 'cart') {
              log.info('Request is PayPal Express.'
                , 'Transaction ID:', ipnpb.txn_id); 
              throw new Error('IGNORED');
            }
            log.error('Unknown transaction type.');
            throw new Error('UNKNOWN');
          }
          result = cache.store[ipnpb.custom].content;
        } else {
          log.error('Payment status not Completed.'); 
          throw new Error('UNCOMPLETED');
        }
        break;
      case 'INVALID':
        log.error('Invalid IPN: IPN message for Transaction ID:'
          , ipnpb.txn_id, 'is invalid.');
        throw new Error('INVALID');
        break;
      default:
        log.error('Unexpected reponse body.');
        throw new Error('UNEXPECTED');
        break;
    }
    return result;
  }

  isCredit(ipnpb, data) {
    //log.info('Data:', data);   
    const { receiver_email, mc_gross, mc_currency } = ipnpb;
    const { credit_validate } = data;
    const isReceiver = receiver_email === credit_validate.receiver_email;
    const isMcGross = Number(mc_gross) === credit_validate.mc_gross;
    const isMcCurrency = mc_currency === credit_validate.mc_currency;
    log.info(
      'email', isReceiver, 'gross', isMcGross, 'currency', isMcCurrency);
    if(!isReceiver || !isMcGross || !isMcCurrency)
      throw new Error('INVALID');
    return data;
  }

  executeExpress(options) {
    const payment = token => Rx.Observable.fromPromise(
      this.putExpress(token, options.paymentID, options.payerID)
    );
    return this.fetchToken()
      .map(oauth => oauth.access_token)
      .flatMap(payment)
      //.map(R.tap(log.trace));
  }

  createExpress(options) {
    const payment = token => Rx.Observable.fromPromise(
      this.getExpress(token)
    );
    return this.fetchToken()
      .map(oauth => oauth.access_token)
      .flatMap(payment)
      //.map(R.tap(log.trace));
  }
};
export default PayPalPayment;

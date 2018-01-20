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
  cleanedAt:  0,            // 
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
          const data = cache.store[body].content;
          if(!data) reject(new Error('UNKNOWN'));
          resolve(data);
          //std.invoke2(() => cache.store[body].content
          //  , data => resolve(data)
          //  , err => reject(new Error('UNKNOWN'))
          //  , 0, 5 * 1000, 30 * 1000);
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

  getNotify(notice) {
    const options = {
      body: Object.assign({}, { cmd: '_notify-validate' }, notice)
    };
    return this.request('/ipnpb', options);
  }

  getCache(custom) {
    const options = {
      body: custom
    };
    return this.request('/cache', options);
  }

  fetchToken() {
    return Rx.Observable.fromPromise(this.getToken());
  }

  fetchNotify(notice) {
    return Rx.Observable.fromPromise(this.getNotify(notice));
  }

  fetchCache(custom) {
    return Rx.Observable.fromPromise(this.getCache(custom));
  }

  validateNotification(notice) {
    const validate = R.curry(this.isNotify);
    return this.fetchNotify(notice)
      .map(validate(notice))
  }

  validateCredit({ custom, receiver_email, mc_gross, mc_currency }) {
    const validate = R.curry(this.isCredit);
    return this.fetchCache(custom)
    .map(validate(receiver_email, mc_gross, mc_currency));
  }

  isCredit(receiver_email, mc_gross, mc_currency, data) {
    const isReceiver = receiver_email === data.receiver_email;
    const isMcGross = mc_gross === Number(data.mc_gross);
    const isMcCurrency = mc_currency === data.mc_currency;
    log.info(isReceiver, isMcGross, isMcCurrency);
    if(!isReceiver || !isMcGross || !isMcCurrency)
      throw new Error('INVALID');
    return 'VERIFIED';
  }

  isNotify(req, res) {
    let result = ''
    const isComplete = req.payment_status === 'Completed';
    switch(res) {
      case 'VERIFIED':
        if(isComplete) {
          log.info('Verified IPN: IPN message for Transaction ID:'
            , req.txn_id, 'is verified.');
          cache.store[req.custom]
            = { content: req, timestamp: Date.now() };
          result = 'VERIFIED';
        } else {
          log.error('Payment status not Completed'); 
          result = 'UNKNOWN';
        }
        break;
      case 'INVALID':
        log.error('Invalid IPN: IPN message for Transaction ID:'
          , req.txn_id, 'is invalid.');
        result = 'INVALID';
        break;
      default:
        log.error('Unexpected reponse body.');
        result = 'UNKNOWN';
        break;
    }
    return result;
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

  parseXml(xml) {
    return Rx.Observable.fromPromise(std.parse_xml(xml));
  }

  forkJoin(promises) {
    return Rx.Observable.forkJoin(promises);
  }

  forParseXml(objs) {
    return this.forkJoin(R.map(obj => this.parseXml(obj), objs));
  }
};
export default PayPalPayment;

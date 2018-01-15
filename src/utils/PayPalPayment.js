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
    switch(operation) {
      case '/ipnpb':
        return new Promise((resolve, reject) => {
          net.post2(ipn_api, null, body, (err, head, data) => {
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

  putPayment(token, paymentID, payerID) {
    const options = {
      auth:   { bearer:   token }
      , body: { payer_id: payerID }
      , json: true
    };
    return this.request(
      `/v1/payments/payment/${paymentID}/execute`, options);
  }

  getPayment(token) {
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

  getValidate(notice) {
    const options = {
      body: Object.assign({}, { cmd: '_notify-validate' }, notice)
    };
    return this.request('/ipnpb', options);
  }

  fetchToken() {
    return Rx.Observable.fromPromise(this.getToken());
  }

  fetchValidate(notice) {
    return Rx.Observable.fromPromise(this.getValidate(notice));
  }

  validateNotification(notice) {
    const isValid = R.curry(this.isValidate);
    return this.fetchValidate(notice)
      .map(isValid(notice))
      //.map(R.tap(this.logInfo.bind(this)));
  }

  isValidate(req, res) {
    if (res == 'VERIFIED') {
      if (req.payment_status  == 'Completed') {
        this.logInfo(`Verified IPN:`
          , `IPN message for Transaction ID: ${req.txn_id} is verified.`);
        cache[res.custom] = req;
      } else {
        this.logError('Payment status not Completed'); 
      }
    } else if(res === "INVALID"){
      this.logError(`Invalid IPN:` 
        , `IPN message for Transaction ID: ${req.txn_id} is invalid.`);
    } else {
      this.logError('Unexpected reponse body.');
    }
  }

  executePayment(options) {
    const payment = token => Rx.Observable.fromPromise(
      this.putPayment(token, options.paymentID, options.payerID)
    );
    return this.fetchToken()
      .map(oauth => oauth.access_token)
      .flatMap(payment)
      //.map(R.tap(this.logTrace.bind(this)));
  }

  createPayment(options) {
    const payment = token => Rx.Observable.fromPromise(
      this.getPayment(token)
    );
    return this.fetchToken()
      .map(oauth => oauth.access_token)
      .flatMap(payment)
      //.map(R.tap(this.logTrace.bind(this)));
  }

  logError(name, message) {
    log.error(name, message);
  }

  logInfo(message) {
    log.info('Request:', message);
  }

  logTrace(message) {
    log.trace('Response:', message);
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

import R from 'ramda';
import Rx from 'rx';
import std from './stdutils';
import net from './netutils';
import { logs as log } from './logutils';

const production = 'https://api-3t.paypal.com/nvp';
const sandboxapi = 'https://api-3t.sandbox.paypal.com/nvp';
const params = {
  METHOD:   'SetExpressCheckout'
  , VERSION: 124
}

const pspid = 'PplApiClient';
/**
 * PayPalPayment Api Client class.
 *
 * @constructor
 * @param {string} access_key - The access key for this application.
 * @param {string} secret_key - The secret key for this application.
 * @param {string} token - The access token for this application.
 */
class PayPalPayment {
  constructor(access_key, secret_key, token) {
    this.access_key = access_key;
    this.secret_key = secret_key;
    this.token = token;
  }

  static of({ access_key, secret_key, token }) {
    return new PayPalPayment(access_key, secret_key, token );
  }

  request(operation, options) {
    options = Object.assign({}, params, options);
    const url = this.url(operation, options);
    return new Promise((resolve, reject) => {
      net.get(url, (stat, head, body) => {
        if(stat !== 200) reject(body);
        log.trace(stat, head, body);
        resolve(body);
      });
    });
  }

  getPayment(id) {
    const options = {};
    options['id'] = id;
    return this.request('payment', options);
  }

  fetchPayment(id) {
    return Rx.Observable.fromPromise(this.getPayment(id));
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

  url(operation, options) {
    return sandboxapi;
  }
};
export default PayPalPayment;

import R from 'ramda';
import Rx from 'rx';
import std from './stdutils';
import net from './netutils';
import { logs as log } from './logutils';

const production = 'http://apilayer.net/api/';
const params = {
  format:   1
}

const pspid = 'CryApiClient';
/**
 * CurrencyLayer Api Client class.
 *
 * @constructor
 * @param {string} access_key - The access key for this application.
 * @param {string} secret_key - The secret key for this application.
 * @param {string} token - The access token for this application.
 */
class CurrencyLayer {
  constructor(access_key, secret_key, token) {
    this.access_key = access_key;
    this.secret_key = secret_key;
    this.token = token;
  }

  static of({ access_key, secret_key, token }) {
    return new CurrencyLayer(access_key, secret_key, token );
  }

  request(operation, options) {
    options = Object.assign({}, params, options);
    const url = this.url(operation, options);
    return new Promise((resolve) => {
      net.get(url, (stat, head, body) => {
        if(stat !== 200) reject(body);
        //log.trace(stat, head, body);
        resolve(body);
      });
    });
  }

  getCurrency(id) {
    const options = {};
    options['id'] = id;
    return this.request('currency', options);
  }

  fetchCurrency(id) {
    return Rx.Observable.fromPromise(this.getCurrency(id));
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
    return production;
  }
};
export default CurrencyLayer;

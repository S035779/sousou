import R from 'ramda';
import Rx from 'rx';
import std from './stdutils';
import net from './netutils';
import { logs as log } from './logutils';

const development = 'http://apilayer.net/api/';
const procuctions = 'https://apilayer.net/api/'

const pspid = 'currency-api';
/**
 * CurrencyLayer Api Client class.
 *
 * @constructor
 * @param {string} access_key - The access key for this application.
 * @param {string} secret_key - The secret key for this application.
 * @param {string} token - The access token for this application.
 */
class CurrencyLayer {
  constructor(access_key) {
    this.access_key = access_key;
  }

  static of({ access_key }) {
    return new CurrencyLayer(access_key);
  }

  request(operation, { query }) {
    const url = development + operation;
    switch(operation) {
      case 'list':
        return new Promise((resolve, reject) => {
          net.get(url, query, (err, head, body) => {
            if(err) reject(err);
            resolve(JSON.parse(body));
          });
        });
      case 'live':
        return new Promise((resolve, reject) => {
          net.get(url, query, (err, head, body) => {
            if(err) reject(err);
            resolve(JSON.parse(body));
          });
        });
      case 'historical':
        return new Promise((resolve, reject) => {
          net.get(url, query, (err, head, body) => {
            if(err) reject(err);
            resolve(JSON.parse(body));
          });
        });
      case 'convert':
        return new Promise((resolve, reject) => {
          net.get2(url, query, (err, head, body) => {
            if(err) reject(err);
            resolve(JSON.parse(body));
          });
        });
      case 'timeframe':
        return new Promise((resolve, reject) => {
          net.get2(url, query, (err, head, body) => {
            if(err) reject(err);
            resolve(JSON.parse(body));
          });
        });
      case 'change':
        return new Promise((resolve, reject) => {
          net.get2(url, query, (err, head, body) => {
            if(err) reject(err);
            resolve(JSON.parse(body));
          });
        });
      default:
        return new Promise((resolve, reject) => {
          reject('Unknown Operation!');
        });
    }
  }

  getList() {
    const options = {
      query: {
        access_key: this.access_key
      }
    };
    return this.request('list', options);
  }

  getLive(currencies, source) {
    const options = {
      query: {
        access_key: this.access_key
        , currencies
        , source
      } 
    };
    return this.request('live', options);
  }

  getHistorical(date, source) {
    const options = {
      query: {
        access_key: this.access_key
        , date
        , source
      }
    };
    return this.request('historical', options);
  }

  getConvert(from, to, amount) {
    const options = {
      query: {
        access_key: this.access_key
        , from
        , to
        , amount
      }
    };
    return this.request('convert', options);
  }

  getTimeframe(start_date, end_date, currencies, source) {
    const options = {
      query: {
        access_key: this.access_key
        , start_date
        , end_date
        , currencies
        , source
      }
    };
    return this.request('timeframe', options);
  }

  getChange(start_date, end_date, currencies, source) {
    const options = {
      query: {
        access_key: this.access_key
        , start_date
        , end_date
        , currencies
        , source
      }
    };
    return this.request('change', options);
  }

  fetchCurrency({ usd, jpy }) {
    return Rx.Observable.fromPromise(this.getLive('JPY', 'USD'))
      .map(obj => obj.quotes.USDJPY)
      .map(val => ({
        USDJPY: val
        , USD: Number(usd)*val
        , JPY: Number(jpy) }))
      //.map(R.tap(this.logTrace.bind(this)));
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }
};
export default CurrencyLayer;

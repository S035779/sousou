import R from 'ramda';
import Rx from 'rx';
import xhr from '../utils/xhrutils';
import { M, log } from '../utils/webutils';

log.config('console', 'basic', 'ALL', 'webpay-renderer');

const pspid = 'AppApiClient';
const path = '/api';

export default {
  request(action, options) {
    const uri = path + action;
    switch(action) {
      case '/payment':
        return new Promise((resolve, reject) => {
          xhr.get(uri, options
            , items => { resolve(items); }
            , error => { if(reject) reject(error); } 
          );
        });
      case '/currency':
        return new Promise((resolve, reject) => {
          xhr.get(uri, options
            , items => { resolve(items); }
            , error => { if(reject) reject(error); } 
          );
        });
      default:
        return new Promise((resolve, reject) => {
          if(reject) reject({error: {message: 'Unknown Operation.'}});
        });
    }
  },
  getPayment(options) {
    return this.request('/payment', options);
  },
  getCurrency(options) {
    return this.request('/currency', options);
  },
  fetchCurrency(options) {
    return this.getCurrency(options).then(items => {
      log.trace(`${pspid}>`, 'Response:', items);
      return items;
    });
  },
  fetchPayment(options) {
    return this.getPayment(options).then(items => {
      log.trace(`${pspid}>`, 'Response:', items);
      return items;
    });
  },
}

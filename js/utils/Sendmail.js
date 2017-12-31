import nodemailer from 'nodemailer';
import R from 'ramda';
import Rx from 'rx';
import { logs as log } from './logutils';

const pspid = 'Sendmail';

/**
 * Sendmail class.
 *
 * @constructor
 * @param {string} host - Host of the messaging service.
 * @param {string} secureConnection - Specification of use
 *  of SSL connection.
 * @param {string} port - Port of the messaging service..
 * @param {object} auth - authentication user and password of 
 *  the messaging service.
 */
class Sendmail {
  constructor(host, secure, port, auth) {
    const options = Object.assign({}, { host, secure, port, auth }
      , { tls: { rejectUnauthorized: false } });
    this.transporter = nodemailer.createTransport(options);
  }

  static of({ host, secure, port, auth }) {
    return new Sendmail(host, secure, port, auth);
  }

  request(operation, data) {
    switch(operation) {
      case '/message':
        return new Promise((resolve, reject) => {
          this.transporter.sendMail(data, (err, info) => {
            if(err) reject(err);
            resolve(info);
          });
        });
      default:
        return new Promise((resolve, reject) => {
          reject('Unknown Operation.');
        });
    }
  }

  postMessage(message) {
    return this.request('/message', message);
  }

  createMessage(message) {
    this.logTrace(message);
    const promise = obj =>
      Rx.Observable.fromPromise(this.postMessage(obj));
    return promise(message)
      .map(R.tap(this.logTrace.bind(this)));
  }

  forMessage(objs) {
    const promises = R.map(this.postMessage(obj), objs);
    return Rx.Observable.forkJoin(promises);
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

};
export default Sendmail;

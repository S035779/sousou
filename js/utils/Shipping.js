import fs from 'fs';
import R from 'ramda';
import Rx from 'rx';
import std from './stdutils';
import { logs as log } from './logutils';

const pspid = 'Shipping';

const path = __dirname + '/../csv/'
const files = [
  'country_code.csv'
  , 'ems_1_asia.csv' 
  , 'ems_2_1_middle_east.csv'
  , 'ems_2_1_north_america.csv'
  , 'ems_2_1_oseania.csv'
  , 'ems_2_2_europe.csv' 
  , 'ems_3_africa.csv'
  , 'ems_3_south_america.csv'
  , 'ems_price.csv'
  , 'paypal_africa.csv'
  , 'paypal_americas.csv'
  , 'paypal_asia_pacific.csv'
  , 'paypal_europe.csv'
];

/**
 * Shipping class.
 *
 * @constructor
 * @param {string} length - Length of shippment.
 * @param {string} height - Weight of shippment.
 * @param {string} from - Shipping source.
 */
class Shipping {
  constructor(length, weight, from) {
    this.length = length;
    this.weight = weight;
    this.from = from;
  }

  static of({ length, weight, from }) {
    return new Shipping(length, weight, from);
  }

  request(operation) {
    const file = path + operation;
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
        if(err) reject(err.message);
        //log.trace(data);
        resolve(data);
      });
    });
  }

  getFile(file) {
    return this.request(file);
  }

  forFile(files) {
    const promises = R.map(this.getFile.bind(this), files);
    return Rx.Observable.forkJoin(promises);
  }

  fetchShipping() {
    return this.forFile(files)
      .map(R.map(R.split('\n')))
      .map(R.map(R.filter(s => s !== '')))
      .map(this.setFile.bind(this))
      .map(R.tap(log.trace.bind(this)));
  }

  setFile(objs) {
    const code = R.map(R.split(','),objs[0]);
    const country_code = R.map(this.setCode, code)
    const ems_1 = objs[1]
    const ems_2_1 = R.flatten(R.slice(2, 5, objs))
    const ems_2_2 = objs[5]
    const ems_3 = R.concat(objs[6],objs[7])
    const price = R.map(R.split(','),objs[8]);
    const ems_price = R.map(this.setPrice, price)
    const paypal_area = R.flatten(R.slice(9,14, objs))

    let results = [];
    results = this.setPaypal(country_code, paypal_area); 
    results = this.setEms1(results, ems_1);
    results = this.setEms2_1(results, ems_2_1);
    results = this.setEms2_2(results, ems_2_2);
    results = this.setEms3(results, ems_3);
    results = this.setPrice(results, ems_price);
    return results;
  }

  setPrice(country_code, ems_price) {
    return R.map(code => {
      return this.getPrice(code, ems_price)
        ? Object.assgin({}, code, { price })
        : Object.assgin({}, code);
    }, country_code);
  }

  getPrice(code, prices) {
    for(let i=0; i<prices.length; i++) {
      if(this.weight < prices[0]) {
        if(code.ems1   === 'ok') return prices[1];
        if(code.ems2_1 === 'ok') return prices[2];
        if(code.ems2_2 === 'ok') return prices[3];
        if(code.ems3   === 'ok') return prices[4];
      }
      return 0;
    }
  }

  setEms3(country_code, ems_area) {
    return R.map(code => (
      this.isArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems3: 'ok' })
      : Object.assign({}, code, { ems3: 'ng' })
    ), country_code);
  }

  setEms2_2(country_code, ems_area) {
    return R.map(code => (
      this.isArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems2_2: 'ok' })
      : Object.assign({}, code, { ems2_2: 'ng' })
    ), country_code);
  }

  setEms2_1(country_code, ems_area) {
    return R.map(code => (
      this.isArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems2_1: 'ok' })
      : Object.assign({}, code, { ems2_1: 'ng' })
    ), country_code);
  }

  setEms1(country_code, ems_area) {
    return R.map(code => (
      this.isArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems1: 'ok' })
      : Object.assign({}, code, { ems1: 'ng' })
    ), country_code);
  }

  setPaypal(country_code, paypal_area) {
    return R.map(code => (
      this.isArea(code.name_en, paypal_area) 
      ? Object.assign({}, code, { paypal: 'ok' })
      : Object.assign({}, code, { paypal: 'ng' })
    ), country_code);
  }

  isArea(name, areas) {
    for(let i=0; i<areas.length; i++) 
      if(areas[i] === name) return true;
    return false;
  }

  setPrice(arr) {
    return { weight: arr[0], area_1: arr[1], area_2_1: arr[2]
      , area_2_2: arr[3], area_3: arr[4] };
  }

  setCode(arr) {
    return { code_2: arr[0], code_3: arr[1], code_id: arr[2]
      , name_jp: arr[3], name_en: arr[4], number: arr[5]};
  }

};
export default Shipping;

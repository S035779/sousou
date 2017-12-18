import fs from 'fs';
import R from 'ramda';
import Rx from 'rx';
import std from './stdutils';
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
  constructor(host, secureConnection, port, auth) {
    this.host = host;
    this.secureConnection = secureConnection;
    this.port = port;
    this.auth = auth;
  }

  static of({ host, secureConnection, port, auth }) {
    return new Sendmail(host, secureConnection, port, auth);
  }

  request(operation) {
    const file = path + operation;
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
        if(err) reject(err.message);
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
      .map(this.setFiles.bind(this))
      //.map(R.tap(this.logTrace.bind(this)));
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

  setFiles(objs) {
    const tmp_1 = R.map(R.split(','),objs[0]);
    const country_code = R.map(this.setCode, tmp_1)
    const ems_1 = objs[1]
    const ems_2_1 = R.flatten(R.slice(2, 5, objs))
    const ems_2_2 = objs[5]
    const ems_3 = R.concat(objs[6],objs[7])
    const tmp_2 = R.map(R.split(','),objs[8]);
    const ems_price = R.map(this.setEmsPrice, tmp_2)
    const paypal_area = R.flatten(R.slice(9,14, objs))

    let ems = this.setPaypal(country_code, paypal_area);
    ems = this.setEms1(ems_1, ems)
    ems = this.setEms2_1(ems_2_1, ems)
    ems = this.setEms2_2(ems_2_2, ems)
    ems = this.setEms3(ems_3, ems)
    ems = this.setEmsPrices(ems_price, ems)

    const jpp_hokkaido = objs[13];
    const jpp_touhoku = objs[14];
    const jpp_kantou = objs[15];
    const jpp_shinetsu = objs[16];
    const jpp_hokuriku = objs[17];
    const jpp_toukai = objs[18];
    const jpp_kinki = objs[19];
    const jpp_chuugoku = objs[20];
    const jpp_shikoku = objs[21];
    const jpp_kyuusyuu = objs[22];
    const jpp_okinawa = objs[23];
    const tmp_3 = R.map(R.split(','),objs[24]);
    const jpp_area = R.map(this.setJppArea, tmp_3);
    const tmp_4 = R.map(R.split(','),objs[25]);
    const jpp_price = R.map(this.setJppPrice, tmp_4);

    let jpp = [];
    jpp = this.setHokkaido(jpp_hokkaido, jpp)
    jpp = this.setTouhoku(jpp_touhoku, jpp)
    jpp = this.setKantou(jpp_kantou, jpp)
    jpp = this.setShinetsu(jpp_shinetsu, jpp)
    jpp = this.setHokuriku(jpp_hokuriku, jpp)
    jpp = this.setToukai(jpp_toukai, jpp)
    jpp = this.setKinki(jpp_kinki, jpp)
    jpp = this.setChuugoku(jpp_chuugoku, jpp)
    jpp = this.setShikoku(jpp_shikoku, jpp)
    jpp = this.setKyuusyuu(jpp_kyuusyuu, jpp)
    jpp = this.setOkinawa(jpp_okinawa, jpp)
    jpp = this.setJppAreas(jpp_area, jpp)
    jpp = this.setJppPrices(jpp_price, jpp)

    return { ems, jpp };
  }

  setJppPrices(jpp_prices, objs) {
    const prices = this.isJppPrice(jpp_prices);
    return R.map(obj => Object.assign({}, obj
      , { size: this.length, price: prices[obj.destination] }), objs);
  }

  setJppAreas(jpp_area, objs) {
    const src = this.isJppArea(objs);
    const dst = jpp_area[src-1].destinations;
    return R.map(obj => Object.assign({}, obj, {
        source: src
        , destination: this.from === obj.city ? 0 : dst[obj.code-1]
      }), objs);
  }

  setOkinawa(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '沖縄', code: 11 }), jpp_area);
    return R.concat(objs, area);
  }

  setKyuusyuu(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '九州', code: 10 }), jpp_area);
    return R.concat(objs, area);
  }

  setShikoku(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '四国', code: 9 }), jpp_area);
    return R.concat(objs, area);
  }

  setChuugoku(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '中国', code: 8 }), jpp_area);
    return R.concat(objs, area);
  }

  setKinki(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '近畿', code: 7 }), jpp_area);
    return R.concat(objs, area);
  }

  setToukai(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '東海', code: 6 }), jpp_area);
    return R.concat(objs, area);
  }

  setHokuriku(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '北陸', code: 5 }), jpp_area);
    return R.concat(objs, area);
  }

  setShinetsu(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '信越', code: 4 }), jpp_area);
    return R.concat(objs, area);
  }

  setKantou(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '関東', code: 3 }), jpp_area);
    return R.concat(objs, area);
  }

  setTouhoku(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '東北', code: 2 }), jpp_area);
    return R.concat(objs, area);
  }

  setHokkaido(jpp_area, objs) {
    const area = R.map(city => (
      { city, area: '北海道', code: 1 }), jpp_area);
    return R.concat(objs, area);
  }

  setEmsPrices(ems_price, objs) {
    return R.map(code => {
      const price = this.isEmsPrices(code, ems_price)
      return price
        ? Object.assign({}, code, { price })
        : Object.assign({}, code);
    }, objs);
  }

  setEms3(ems_area, objs) {
    return R.map(code => (
      this.isEmsArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems3: 'OK' })
      : Object.assign({}, code, { ems3: 'NO' })
    ), objs);
  }

  setEms2_2(ems_area, objs) {
    return R.map(code => (
      this.isEmsArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems2_2: 'OK' })
      : Object.assign({}, code, { ems2_2: 'NO' })
    ), objs);
  }

  setEms2_1(ems_area, objs) {
    return R.map(code => (
      this.isEmsArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems2_1: 'OK' })
      : Object.assign({}, code, { ems2_1: 'NO' })
    ), objs);
  }

  setEms1(ems_area, objs) {
    return R.map(code => (
      this.isEmsArea(code.name_jp, ems_area) 
      ? Object.assign({}, code, { ems1: 'OK' })
      : Object.assign({}, code, { ems1: 'NO' })
    ), objs);
  }

  setPaypal(country_code, paypal_area) {
    return R.map(code => (
      this.isEmsArea(code.name_en, paypal_area) 
      ? Object.assign({}, code, { paypal: 'OK' })
      : Object.assign({}, code, { paypal: 'NO' })
    ), country_code);
  }

  isEmsPrices(code, prices) {
    for(let i=0; i<prices.length; i++) {
      if(Number(this.weight) <= Number(prices[i].weight)) {
        if     (code.ems1   === 'OK') return prices[i].area_1;
        else if(code.ems2_1 === 'OK') return prices[i].area_2_1;
        else if(code.ems2_2 === 'OK') return prices[i].area_2_2;
        else if(code.ems3   === 'OK') return prices[i].area_3;
      }
    }
    return 0;
  }

  isEmsArea(name, areas) {
    for(let i=0; i<areas.length; i++) 
      if(areas[i] === name) return true;
    return false;
  }

  isJppPrice(objs) {
    for( let i=0; i<objs.length; i++ ) {
      if(this.length === objs[i].length) return objs[i].prices;
    }
    return 0;
  }

  isJppArea(objs) {
    for( let i=0; i<objs.length; i++ ) {
      if(this.from === objs[i].city) return objs[i].code;
    }
    return 0;
  }

  setEmsPrice(cols) {
    return {
      weight:     cols[0]
      , area_1:   cols[1]
      , area_2_1: cols[2]
      , area_2_2: cols[3]
      , area_3:   cols[4]
    };
  }

  setCode(cols) {
    return {
      code_2:     cols[0]
      , code_3:   cols[1]
      , code_id:  cols[2]
      , name_jp:  cols[3]
      , name_en:  cols[4]
      , number:   cols[5]
    };
  }

  setJppPrice(objs) {
    return {
      length: objs[0]
      , prices: [
        objs[1]
        , objs[2]
        , objs[3]
        , objs[4]
        , objs[5]
        , objs[6]
        , objs[7]
        , objs[8]
      ]
    };
  }

  setJppArea(objs) {
    return {
      source: objs[0]
      , destinations: [
        objs[1]
        , objs[2]
        , objs[3]
        , objs[4]
        , objs[5]
        , objs[6]
        , objs[7]
        , objs[8]
        , objs[9]
        , objs[10]
        , objs[11]
      ] 
    };
  }
};
export default Shipping;

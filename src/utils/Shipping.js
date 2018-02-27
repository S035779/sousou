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
  //, 'ems_price.csv'
  , 'fwp_price_usd.csv'
  , 'paypal_africa.csv'
  , 'paypal_americas.csv'
  , 'paypal_asia_pacific.csv'
  , 'paypal_europe.csv'
  , 'jpp_hokkaido.csv'
  , 'jpp_touhoku.csv'
  , 'jpp_kantou.csv'
  , 'jpp_shinetsu.csv'
  , 'jpp_hokuriku.csv'
  , 'jpp_toukai.csv'
  , 'jpp_kinki.csv'
  , 'jpp_chuugoku.csv'
  , 'jpp_shikoku.csv'
  , 'jpp_kyuusyuu.csv'
  , 'jpp_okinawa.csv'
  , 'jpp_matrix.csv'
  //, 'jpp_price.csv'
  , 'fwp_price_yen.csv'
  , 'confirmed.csv'
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
    this.from = decodeURIComponent(from);
  }

  static of({ length, weight, from }) {
    return new Shipping(length, weight, from);
  }

  request(operation) {
    const file = path + operation;
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
        if(err) reject(err);
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

  setEmsFiles(objs) {
    const tmp_1 = R.map(R.split(','),objs[0]);
    const country_code = R.map(this.setCode, tmp_1)
    const ems_1 = objs[1]
    const ems_2_1 = R.flatten(R.slice(2, 5, objs))
    const ems_2_2 = objs[5]
    const ems_3 = R.concat(objs[6],objs[7])
    const tmp_2 = R.map(R.split(','),objs[8]);
    const ems_price = R.map(this.setEmsPrice, tmp_2)
    const paypal_area = R.flatten(R.slice(9,14, objs))
    const fwp_confirm = R.map(R.split(','),objs[26]);

    const Paypal = R.curry(this.setPaypal.bind(this));
    const Ems1 = R.curry(this.setEms1.bind(this));
    const Ems2_1 = R.curry(this.setEms2_1.bind(this));
    const Ems2_2 = R.curry(this.setEms2_2.bind(this));
    const Ems3 = R.curry(this.setEms3.bind(this));
    const EmsPrices = R.curry(this.setEmsPrices.bind(this));
    const FwpConfirm = R.curry(this.setFwpConfirm.bind(this));
    return  R.compose(
      FwpConfirm(fwp_confirm),
      EmsPrices(ems_price),
      Ems3(ems_3),
      Ems2_2(ems_2_2),
      Ems2_1(ems_2_1),
      Ems1(ems_1),
      Paypal(country_code)
    )(paypal_area);
  }

  setJppFiles(objs) {
    const jpp_hokkaido = R.map(R.split(','),objs[13]);
    const jpp_touhoku = R.map(R.split(','),objs[14]);
    const jpp_kantou = R.map(R.split(','),objs[15]);
    const jpp_shinetsu = R.map(R.split(','),objs[16]);
    const jpp_hokuriku = R.map(R.split(','),objs[17]);
    const jpp_toukai = R.map(R.split(','),objs[18]);
    const jpp_kinki = R.map(R.split(','),objs[19]);
    const jpp_chuugoku = R.map(R.split(','),objs[20]);
    const jpp_shikoku = R.map(R.split(','),objs[21]);
    const jpp_kyuusyuu = R.map(R.split(','),objs[22]);
    const jpp_okinawa = R.map(R.split(','),objs[23]);
    const tmp_3 = R.map(R.split(','),objs[24]);
    const jpp_area = R.map(this.setJppArea, tmp_3);
    const tmp_4 = R.map(R.split(','),objs[25]);
    const jpp_price = R.map(this.setJppPrice, tmp_4);

    const Hokkaido = R.curry(this.setHokkaido.bind(this));
    const Touhoku = R.curry(this.setTouhoku.bind(this));
    const Kantou = R.curry(this.setKantou.bind(this));
    const Shinetsu = R.curry(this.setShinetsu.bind(this));
    const Hokuriku = R.curry(this.setHokuriku.bind(this));
    const Toukai = R.curry(this.setToukai.bind(this));
    const Kinki = R.curry(this.setKinki.bind(this));
    const Chuugoku = R.curry(this.setChuugoku.bind(this));
    const Shikoku = R.curry(this.setShikoku.bind(this));
    const Kyuusyuu = R.curry(this.setKyuusyuu.bind(this));
    const Okinawa = R.curry(this.setOkinawa.bind(this));
    const JppAreas = R.curry(this.setJppAreas.bind(this));
    const JppPrices = R.curry(this.setJppPrices.bind(this));
    return R.compose(
      JppPrices(jpp_price),
      JppAreas(jpp_area),
      Okinawa(jpp_okinawa),
      Kyuusyuu(jpp_kyuusyuu),
      Shikoku(jpp_shikoku),
      Chuugoku(jpp_chuugoku),
      Kinki(jpp_kinki),
      Toukai(jpp_toukai),
      Hokuriku(jpp_hokuriku),
      Shinetsu(jpp_shinetsu),
      Kantou(jpp_kantou),
      Touhoku(jpp_touhoku),
      Hokkaido(jpp_hokkaido)
    )([]);
  }

  setFiles(objs) {
    const ems = this.setEmsFiles(objs);
    const jpp = this.setJppFiles(objs);
    return { ems, jpp };
  }

  setFwpConfirm(fwp_confirm, objs) {
    const confirm = this.isFwpConfirm(fwp_confirm);
    return R.map(code =>
      Object.assign({}, code, {
        fwp: confirm[code.name_en] ? confirm[code.name_en] : 'NA'
      }), objs);
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
        , destination: this.from === obj.name_jp ? 0 : dst[obj.code-1]
      }), objs);
  }

  setOkinawa(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '沖縄', code: 11
    }), jpp_area);
    return R.concat(objs, area);
  }

  setKyuusyuu(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '九州', code: 10
    }), jpp_area);
    return R.concat(objs, area);
  }

  setShikoku(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '四国', code: 9
    }), jpp_area);
    return R.concat(objs, area);
  }

  setChuugoku(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '中国', code: 8
    }), jpp_area);
    return R.concat(objs, area);
  }

  setKinki(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '近畿', code: 7
    }), jpp_area);
    return R.concat(objs, area);
  }

  setToukai(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '東海', code: 6
    }), jpp_area);
    return R.concat(objs, area);
  }

  setHokuriku(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '北陸', code: 5
    }), jpp_area);
    return R.concat(objs, area);
  }

  setShinetsu(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '信越', code: 4
    }), jpp_area);
    return R.concat(objs, area);
  }

  setKantou(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '関東', code: 3
    }), jpp_area);
    return R.concat(objs, area);
  }

  setTouhoku(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '東北', code: 2
    }), jpp_area);
    return R.concat(objs, area);
  }

  setHokkaido(jpp_area, objs) {
    const area = R.map(city => ({
      name_jp: city[0], name_en: city[1], area: '北海道', code: 1
    }), jpp_area);
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

  isFwpConfirm(objs) {
    let result = {};
    for (let i=0; i<objs.length; i++) {
      result[objs[i][0]] = objs[i][2];
    }
    return result;
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
      if(this.from === objs[i].name_jp) return objs[i].code;
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

import std      from 'Utilities/stdutils';
import xhr      from 'Utilities/xhrutils';
import { log }  from 'Utilities/webutils';

const env = process.env.NODE_ENV || 'development';
const productions_access_key  = process.env.PAYPAL_ACCESS_KEY;
const development_access_key  = process.env.PAYPAL_ACCESS_KEY;
const sender                  = process.env.MMS_FROM;
const host                    = process.env.TOP_URL;
const api_path                = process.env.API_PATH;
const api                     = host + api_path;

const displayName = 'AppApiClient';

let paypal_env = '';
if (env === 'development') {
  paypal_env = 'sandbox';
  log.config('console', 'basic', 'webpay-renderer', 'TRACE');
} else if (env === 'staging') {
  paypal_env = 'sandbox';
  log.config('console', 'basic', 'webpay-renderer', 'DEBUG');
} else if (env === 'production') {
  paypal_env = 'production';
  log.config('console', 'json', 'webpay-renderer', 'INFO');
}
log.info(`${displayName}>`, 'Paypal Environment:', paypal_env);
log.info(`${displayName}>`, 'PayPal Payment API URI:', api);

export default {
  request(operation, options) {
    const uri = api + operation;
    switch(operation) {
      case '/payment/express':
        return new Promise((resolve, reject) => {
          paypal.Button.render({
            env: paypal_env
            , locale: options.infomation.site
            , commit: true
            , style: {
              size:     'responsive' 
              , color:  'gold'
              , shape:  'rect'
              , label:  'paypal'
            }
            , client: {
              sandbox:    development_access_key,
              production: productions_access_key
            }
            , payment: function(data, actions) {
              return actions.payment.create({
                payment: { transactions: [{
                  amount: {
                    total:            options.total
                    , currency:       options.currency
                    , details:        options.details
                  },
                  item_list: {
                    items:            [options.item],
                    shipping_address: options.shipping_address
                  }
                }]}
              });
            }
            , onAuthorize: function(data, actions) {
              return actions.payment.execute()
                .then(payment => {
                  resolve(payment);
                });
            }
            , onCancel: function() {
              reject({ error:
                { name: 'Error', message: 'Buyer cancelled the payment.' }
              });
            }
            , onError: function(err) {
              reject(err);
            }
          }, '#paypal-button');
        });
      //case '/payment':
      //  return new Promise((resolve, reject) => {
      //    paypal.Button.render({
      //      env: paypal_env
      //      , locale: 'ja_JP'
      //      , commit: true
      //      , style: {
      //        size:     'responsive' 
      //        , color:  'gold'
      //        , shape:  'rect'
      //        , label:  'paypal'
      //      }
      //      , payment: function() {
      //        return paypal.request.post(uri + '/create-payment')
      //          .then(res => res.id);
      //      }
      //      , onAuthorize: function(data) {
      //        return paypal.request.post(uri + '/execute-payment'
      //          , { paymentID: data.paymentID, payerID: data.payerID })
      //          .then(payment => {
      //            resolve(payment)
      //        });
      //      }
      //      , onCancel: function() {
      //        reject({ error:
      //          { name: 'Error', message: 'Buyer cancelled the payment.' }
      //        });
      //     }
      //      , onError: function(err) {
      //        reject(err);
      //      }
      //    }, '#paypal-button');
      //  });
      case '/payment/credit':
        return new Promise((resolve, reject) => {
          xhr.postJSON(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      case '/sendmail':
        return new Promise((resolve, reject) => {
          xhr.postJSON(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      case '/shipping':
        return new Promise((resolve, reject) => {
          xhr.getJSON(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      case '/currency':
        return new Promise((resolve, reject) => {
          xhr.getJSON(uri, options
            , obj => { resolve(obj); }
            , err => { reject(err); });
          });
      default:
        return new Promise((resolve, reject) => {
            reject({ error: 
              { name: 'Error', message: 'Unknown Operation.' }});
          });
    }
  },
  postCredit(options) {
    return this.request('/payment/credit', options);
  },
  postExpress(options) {
    return this.request('/payment/express', options);
  },
  postMessage(options) {
    return this.request('/sendmail', options);
  },
  getShipping(options) {
    return this.request('/shipping', options);
  },
  getCurrency(options) {
    return this.request('/currency', options);
  },
  createCredit(params) {
    const options = this.validate(params);
    const buyer = this.setCustomer(options);
    const seler = this.setManager(options);
    return this.postCredit(Object.assign({}, options, {buyer}, {seler}))
  },
  createExpress(params) {
    const options = this.validate(params);
    const buyer = this.setCustomer(options);
    const seler = this.setManager(options);
    return this.postExpress(options)
      .then(() => this.postMessage(seler))
      .then(() => this.postMessage(buyer))
  },
  createMessage(params) {
    const options = this.validate(params);
    const buyer = this.setCustomer(options);
    const seler = this.setManager(options);
    return this.postMessage(seler)
      .then(() => this.postMessage(buyer))
  },
  fetchShipping(options) {
    return this.getShipping(options)
  },
  fetchCurrency(options) {
    return this.getCurrency(options)
  },
  validate(params) {
    const { item, shipping_address, infomation } = params;
    let newItem = {};
    let newAddr = {};
    let newInfo = {};
    newItem['quantity'] = Array.isArray(item.quantity)
      ? item.quantity.join()
      : item.quantity;
    newAddr['country_code'] = Array.isArray(shipping_address.country_code)
      ? shipping_address.country_code.join()
      : shipping_address.country_code;
    newInfo['country_code'] = Array.isArray(infomation.country_code)
      ? infomation.country_code.join()
      : infomation.country_code;
    newInfo['payment'] = Array.isArray(infomation.payment)
      ? infomation.payment.join()
      : infomation.payment;
    return Object.assign({}, params, {
      item: Object.assign({},item, newItem)
      , shipping_address: Object.assign({}, shipping_address, newAddr)
      , infomation: Object.assign({}, infomation, newInfo)
    });
  },
  setManager(obj) {
    const message = obj.infomation.site === 'ja_JP'
      ? {
        to: {
          name: 'FWP Research',         address: sender
        }
      , from:  {
          name: obj.infomation.company, address: obj.infomation.email
        }
      , subject:  `(Yearbook) ${
          obj.infomation.company
        } : Yearbook Vol.1のご注文がありました`
      , text: `FWP Researchの公式HPからYearbook vol.1の注文がありました。`
        + `\n\n`
        + `--------------------------------------------------------------`
        + `--------\n`
        + `ご注文内容\n\n`
        + `お申込み元サイト: ${obj.infomation.site}\n`
        + `名前            : ${obj.infomation.name}\n`
        + `会社名          : ${obj.infomation.company}\n`
        + `メールアドレス  : ${obj.infomation.email}\n`
        + `電話番号        : ${obj.infomation.phone}\n`
        + `ご購入数と通貨  : ${
          obj.item.quantity > 0 && obj.item.quantity < 11
            ? obj.item.quantity + '冊' : 'その他'
          } 【${obj.currency}】\n`
        + `お支払い方法    : ${obj.infomation.payment_method}\n`
        + `お引き渡し場所  : ${obj.infomation.postal_code}`
          + ` ${obj.infomation.address1} ${obj.infomation.address2}\n`
          + ` ${obj.infomation.country}\n`
        + `お届け先人名    : ${obj.infomation.recipient_name}\n`
        + `お届け先電話番号: ${obj.infomation.recipient_phone}\n`
        + `ご連絡事項      :\n`
        + `${obj.infomation.message}\n`
        + `--------------------------------------------------------------`
        + `--------\n`
      } : {
        to:       {
          name: 'FWP Research',         address: sender
        }
      , from:     {
          name: obj.infomation.company, address: obj.infomation.email
        }
      , subject:  `(Yearbook) ${
          obj.infomation.company
        } : There was an order for Yearbook vol.1`
      , text: `We have the following order from FWP research official HP.`
        + `\n\n`
        + `--------------------------------------------------------------`
        + `--------\n`
        + `Application details\n\n`
        + `Site             : ${obj.infomation.site}\n`
        + `Name             : ${obj.infomation.name}\n`
        + `Company Name     : ${obj.infomation.company}\n`
        + `E-Mail address   : ${obj.infomation.email}\n`
        + `Phone number     : ${obj.infomation.phone}\n`
        + `Order details    : ${
          obj.item.quantity > 0 && obj.item.quantity < 11
            ? obj.item.quantity + 'books' : 'other'
          } x ${obj.currency}\n`
        + `Payment method   : ${obj.infomation.payment_method}\n`
        + `Place of delivery: ${obj.infomation.postal_code}`
          + ` ${obj.infomation.address1} ${obj.infomation.address2}`
          + ` ${obj.infomation.country}\n`
        + `Recipient\'s name : ${obj.infomation.recipient_name}\n`
        + `Recipient\'s phone: ${obj.infomation.recipient_phone}\n`
        + `Message          :\n`
        + `${obj.infomation.message}\n\n`
        + `--------------------------------------------------------------`
        + `--------\n`
    };
    return { message };
  },
  setCustomer(obj) {
    const message = obj.infomation.site === 'ja_JP'
      ? {
        to:       {
          name: obj.infomation.company, address: obj.infomation.email
        }
      , from:     {
          name: 'FWP Research',         address: sender
        }
      , subject:
        `【FWP Research】ご注文内容の確認-ミャンマー企業年鑑 Vol.1`
      , text: `${obj.infomation.name} 様\n\n`
        + `この度は、ミャンマー企業年鑑 Vol.1をご注文いただきまして、`
          + `誠にありがとう`
        + `ございます。\n\n`
        + `このメールは、ご注文内容確認のため、`
          + `自動配信にてお知らせしています。\n`
        + `ご注文内容の確認を行い、後日改めて`
          + `ご連絡させていただきますので、\n`
        + `しばらくお待ちくださいませ。\n\n\n`
        + `--------------------------------------------------------------`
        + `--------\n`
        + `ご注文内容\n\n`
        + `お申込み元サイト: ${obj.infomation.site}\n`
        + `名前            : ${obj.infomation.name}\n`
        + `会社名          : ${obj.infomation.company}\n`
        + `メールアドレス  : ${obj.infomation.email}\n`
        + `電話番号        : ${obj.infomation.phone}\n`
        + `ご購入数と通貨  : ${
          obj.item.quantity > 0 && obj.item.quantity < 11
            ? obj.item.quantity + ' 冊' : 'その他'
          } 【${obj.currency}】\n`
        + `お支払い方法    : ${obj.infomation.payment_method}\n`
        + `お引き渡し場所  : ${obj.infomation.postal_code}`
          + ` ${obj.infomation.address1} ${obj.infomation.address2}`
          + ` ${obj.infomation.country}\n`
        + `お届け先人名    : ${obj.infomation.recipient_name}\n`
        + `お届け先電話番号: ${obj.infomation.recipient_phone}\n`
        + `ご連絡事項      :\n`
        + `${obj.infomation.message}\n\n`
        + `--------------------------------------------------------------`
        + `--------\n\n`
        + `==============================================================`
        + `========\n`
        + `このメールにお心当たりのない場合はお手数ですが、当社までご連絡`
        + `をお願い\n`
        + `致します。\n`
        + `= FWP Research =\n`
        + `info@fwpresearch.com\n`
        + `http://fwpresearch.com\n`
        + `(JAPAN)    TEL +81 3-3641-8998\n`
        + `(MYANMAR)  TEL +95 94-5210-2233\n`
        + `==============================================================`
        + `========\n`
      } : {
        to:       {
          name: obj.infomation.company, address: obj.infomation.email
        }
      , from:     {
          name: 'FWP Research',         address: sender
        }
      , subject: `(FWP Research) Confirmation of your order `
          + `- Myanmar Companies Yearbook Vol.1`
      , text: `Dear ${obj.infomation.name},\n\n`
        + `Thank you very much for ordering `
          + `Myanmar Companies Yearbook Vol.1\n`
        + `at this time.\n\n`
        + `This mail is informed by automatic delivery `
          + `for your order details \n`
        + `confirmation.\n`
        + `Because we will confirm your order details `
          + `then contact you later, \n`
          + `so please wait a moment now.\n\n`
        + `--------------------------------------------------------------`
        + `--------\n`
        + `Application details\n\n`
        + `Site             : ${obj.infomation.site}\n`
        + `Name             : ${obj.infomation.name}\n`
        + `Company name     : ${obj.infomation.company}\n`
        + `E-Mail address   : ${obj.infomation.email}\n`
        + `Phone number     : ${obj.infomation.phone}\n`
        + `Order details    : ${
          obj.item.quantity > 0 && obj.item.quantity < 11
            ? obj.item.quantity + ' books' : 'other'
        } x ${obj.currency}\n`
        + `Payment method   : ${obj.infomation.payment_method}\n`
        + `Place of delivery: ${obj.infomation.postal_code}`
        + ` ${obj.infomation.address1} ${obj.infomation.address2} `
        + ` ${obj.infomation.country}\n`
        + `Recipient\'s name : ${obj.infomation.recipient_name}\n`
        + `Recipient\'s phone: ${obj.infomation.recipient_phone}\n`
        + `Message          :\n`
        + `${obj.infomation.message}\n\n`
        + `--------------------------------------------------------------`
        + `--------\n\n\n`
        + `==============================================================`
        + `========\n`
        + `If this mail doesn't satisfy your inquiry,`
          + ` please kindly contact our company.`
          + ` We are very sorry for your inconvenience.\n\n`
        + `= FWP Research =\n`
        + `info@fwpresearch.com\n`
        + `http://fwpresearch.com\n`
        + `(MYANMAR)  TEL +95 94-5210-2233\n`
        + `(JAPAN)    TEL +81 3-3641-8998\n`
        + `==============================================================`
        + `========\n`
      };
    return { message };
  },
  logInfo(name, message) {
    log.info(`${displayName}>`, name, ':', message);
  },
  logTrace(name, message) {
    log.trace(`${displayName}>`, name, ':', message);
  },
  logError(error) {
    log.error(`${displayName}>`, error.name, ':', error.message);
  },
}

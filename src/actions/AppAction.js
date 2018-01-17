import { dispatch } from 'Main/dispatcher';
import AppApiClient from 'Services/AppApiClient';
import { log } from 'Utilities/webutils';

const pspid = 'AppAction';

export default {
  createCredit(options) {
    return AppApiClient.createCredit(options)
      .then(results => {
        dispatch({ type: 'item/create/credit', results, options });
      }).catch(err => {
        this.logError(err);
        const results = { error: {
          name: 'Credit Payment API Error'
          , message: {
            jp: '入力手続きが完了しませんでした。'
            , en: 'The input procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/create/credit', results, options });
      });
  },
  createExpress(options) {
    return AppApiClient.createExpress(options)
      .then(results => {
        dispatch({ type: 'item/create/express', results, options });
      }).catch(err => {
        this.logError(err);
        const results = { error: {
          name: 'PayPal Payment API Error'
          , message: {
            jp: '入力手続きが完了しませんでした。'
            , en: 'The input procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/create/express', results, options });
      });
  },
  createMessage(options) {
    return AppApiClient.createMessage(options)
      .then(results => {
        dispatch({ type: 'item/create/message', results, options });
      }).catch(err => {
        this.logError(err);
        const results = { error: {
          name: 'Mail messaging API Error'
          , message: {
            jp: 'メッセージ送信が完了しませんでした。'
            , en: 'Message sending was not completed.'
          }
        }};
        dispatch({ type: 'item/create/message', results, options });
      });
  },
  fetchShipping({ length, weight, from }) {
    return AppApiClient.fetchShipping({ length, weight, from })
      .then(shipping => {
        dispatch({ type: 'config/fetch/shipping'
          , shipping, length, weight, from });
      }).catch(err => {
        this.logError(err);
        const results = { error: {
          name: 'Delivery charge API Error'
          , message: {
            jp: '配送料算出手続きが完了しませんでした。'
            , en: 'The shipping fee calculation procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/fetch/shipping', results });
      });
  },
  fetchCurrency({ usd, jpy }) {
    return AppApiClient.fetchCurrency({ usd, jpy })
      .then(currency => {
        dispatch({ type: 'config/fetch/currency'
          , currency, usd, jpy });
      }).catch(err => {
        this.logError(err);
        const results = { error: {
          name: 'Currency API Error'
          , message: {
            jp: '通貨算出手続きが完了しませんでした。'
            , en: 'The currency calculation procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/fetch/currency', results });
      });
  },
  logInfo(request) {
    log.info(`${pspid}>`, 'Request:', request);
  },
  logTrace(response) {
    log.trace(`${pspid}>`, 'Response:', response);
  },
  logError(error) {
    log.error(`${pspid}>`, error.name, error.message);
  }
}

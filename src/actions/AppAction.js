import { dispatch } from '../dispatcher';
import AppApiClient from 'Services/AppApiClient';
import { log } from 'Utilities/webutils';

const pspid = 'AppAction';

export default {
  createPayment(options) {
    return AppApiClient.createPayment(options)
      .then(message => {
        dispatch({ type: 'item/create/payment', message, options });
      }).catch(err => {
        this.logError(err);
        const message = { error: {
          name: 'PayPal Payment API Error'
          , message: {
            jp: '入力手続きが完了しませんでした。'
            , en: 'The input procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/create/payment', message, options });
      });
  },
  createMessage(options) {
    return AppApiClient.createMessage(options)
      .then(message => {
        dispatch({ type: 'item/create/message', message, options });
      }).catch(err => {
        this.logError(err);
        const message = { error: {
          name: 'Mail messaging API Error'
          , message: {
            jp: 'メッセージ送信が完了しませんでした。'
            , en: 'Message sending was not completed.'
          }
        }};
        dispatch({ type: 'item/create/payment', message, options });
      });
  },
  fetchShipping({ length, weight, from }) {
    return AppApiClient.fetchShipping({ length, weight, from })
      .then(shipping => {
        dispatch({ type: 'config/fetch/shipping'
          , shipping, length, weight, from });
      }).catch(err => {
        this.logError(err);
        const message = { error: {
          name: 'Delivery charge API Error'
          , message: {
            jp: '配送料算出手続きが完了しませんでした。'
            , en: 'The shipping fee calculation procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/create/payment', message, options });
      });
  },
  fetchCurrency({ usd, jpy }) {
    return AppApiClient.fetchCurrency({ usd, jpy })
      .then(currency => {
        dispatch({ type: 'config/fetch/currency'
          , currency, usd, jpy });
      }).catch(err => {
        this.logError(err);
        const message = { error: {
          name: 'Currency API Error'
          , message: {
            jp: '通貨算出手続きが完了しませんでした。'
            , en: 'The currency calculation procedure was not completed.'
          }
        }};
        dispatch({ type: 'item/create/payment', message, options });
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

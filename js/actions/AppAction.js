import { dispatch } from '../dispatcher';
import AppApiClient from '../services/AppApiClient';

export default {
  createPayment(options) {
    return AppApiClient.createPayment(options)
      .then(message => {
        dispatch({ type: 'item/create/payment', message, options });
      });
  },
  createMessage(options) {
    return AppApiClient.createMessage(options)
      .then(message => {
        dispatch({ type: 'item/create/message', message, options });
      });
  },
  fetchShipping({ length, weight, from }) {
    return AppApiClient.fetchShipping({ length, weight, from })
      .then(shipping => {
        dispatch({ type: 'config/fetch/shipping'
          , shipping, length, weight, from });
      });
  },
  fetchCurrency({ usd, jpy }) {
    return AppApiClient.fetchCurrency({ usd, jpy })
      .then(currency => {
        dispatch({ type: 'config/fetch/currency'
          , currency, usd, jpy });
      });
  }
}

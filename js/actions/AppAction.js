import { dispatch } from '../dispatcher';
import AppApiClient from '../services/AppApiClient';

export default {
  createPayment(options) {
    return AppApiClient.createPayment(options)
      .then(items => {
        dispatch({ type: 'item/create/payment', items, options });
      });
  },
  createMessage(options) {
    return AppApiClient.createMessage(options)
      .then(items => {
        dispatch({ type: 'item/create/message', items, options });
      });
  },
  fetchShipping({ length, weight, from }) {
    return AppApiClient.fetchShipping({ length, weight, from })
      .then(shipping => {
        dispatch({ type: 'config/fetch/shipping'
          , shipping, query: { length, weight, from } });
      });
  },
  fetchCurrency({ usd, jpy }) {
    return AppApiClient.fetchCurrency({ usd, jpy })
      .then(currency => {
        dispatch({ type: 'config/fetch/currency'
          , currency , query: { usd, jpy }});
      });
  }
}

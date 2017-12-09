import { dispatch } from '../dispatcher';
import AppApiClient from '../services/AppApiClient';

export default {
  fetchPayment(options) {
    return AppApiClient.fetchPayment(options)
      .then(items => {
        dispatch({ type: 'item/fetch/payment', items, options });
      });
  },
  fetchCurrency(options) {
    return AppApiClient.fetchCurrency(options)
      .then(currency => {
        dispatch({ type: 'item/fetch/currency', currency, options });
      });
  }
}

import { dispatch } from '../dispatcher';
import AppApiClient from '../services/AppApiClient';

export default {
  fetchPayment(options) {
    return AppApiClient.fetchPayment(options)
      .then(items => {
        dispatch({ type: 'item/fetch/payment', options, items });
      });
  },
  fetchShipping(options) {
    return AppApiClient.fetchShipping(options)
      .then(shipping => {
        dispatch({ type: 'config/fetch/shipping', shipping });
      });
  },
  fetchCurrency(options) {
    return AppApiClient.fetchCurrency(options)
      .then(currency => {
        dispatch({ type: 'config/fetch/currency', currency });
      });
  }
}

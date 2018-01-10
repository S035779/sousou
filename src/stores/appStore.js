import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import AppAction from '../actions/AppAction';

class AppStore extends ReduceStore<number> {
  getInitialState() {
    return { 
      length: 0
      , weigth: 0
      , from: ''
      , usd: 0
      , jpy: 0
      , shipping: {}
      , currency: {}
      , results:  null
      , options:  {
        total:  0
        , currency: []
        , details:
          {
            subtotal: 0
            , shipping: 0
          }
        , item: { 
          name: ''
          , description: ''
          , quantity: []
          , price: 0
          , currency: []
        }
        , shipping_address: {
          recipient_name: ''
          , line1: ''
          , line2: ''
          , city: ''
          , country_code: []
          , postal_code: ''
          , phone: ''
          , state: ''
        }
        , infomation: {
          first_name: ''
          , last_name: ''
        //  , gender: ''
        //  , year: ''
        //  , month: []
        //  , day: ''
          , email: ''
        //  , confirm_email: ''
          , delivery: 'address'
          , payment: []
          , message: ''
        //  , agreement: false
        }
      }};
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'item/create/payment':
        return Object.assign({}, state, {
          results:    action.results
          , options:  action.options
        });
      case 'item/create/message':
        return Object.assign({}, state, {
          results:    action.results
          , options:  action.options
        });
      case 'config/fetch/shipping':
        return Object.assign({}, state, {
          length:     action.length
          , weight:   action.weight
          , from:     action.from
          , shipping: action.shipping
        });
      case 'config/fetch/currency':
        return Object.assign({}, state, {
          usd:      action.usd
          , jpy:    action.jpy
          , currency: action.currency
        });
      default: 
        return state; 
    } 
  } 
}
export default new AppStore(dispatcher);

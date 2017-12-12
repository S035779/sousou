import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import AppAction from '../actions/AppAction';

class AppStore extends ReduceStore<number> {
  getInitialState() {
    return { 
      shipping:   {}
      , items:    {}
      , options:  {
        total:  0
        , currency: ''
        , details:  { subtotal: 0, shipping: 0 }
        , item: { 
          name: ''
          , description: ''
          , quantity: 0
          , price: 0
          , currency: ''
        }
        , shipping_address: {
          recipient_name: ''
          , line1: ''
          , line2: ''
          , city: ''
          , country_code: ''
          , postal_code: ''
          , phone: ''
          , state: ''
        }}};
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'item/fetch/payment':
        return Object.assign({}, state, {
          items:    action.items
          , options:  action.options
        });
      case 'config/fetch/shipping':
        return Object.assign({}, state, {
          shipping: action.shipping
        });
      default: 
        return state; 
    } 
  } 
}
export default new AppStore(dispatcher);

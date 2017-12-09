import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import AppAction from '../actions/AppAction';

class AppStore extends ReduceStore<number> {
  getInitialState() {
    return { 
      currency: []
      , items:  []
      , options: { id: 0, token: '' }
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'item/fetch/payment':
        return Object.assign({}, state, 
          { items: action.items       , options: action.options });
      case 'item/fetch/currency':
        return Object.assign({}, state, 
          { currency: action.currency , options: action.options });
      default: 
        return state; 
    } 
  } 
}
export default new AppStore(dispatcher);

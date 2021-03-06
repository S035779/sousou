import { ReduceStore } from 'flux/utils';

class AppStore extends ReduceStore {
  getInitialState() {
    return { 
      length:     0
      , weigth:   0
      , from:     ''
      , usd:      0
      , jpy:      0
      , shipping: {}
      , currency: {}
      , results:  null
      , options: {
        total:      0
        , currency: []
        , details: {
          subtotal:             0
          , shipping:           0
          , shipping_discount:  0
        }
        , item: { 
          name:           ''
          , description:  ''
          , quantity:     []
          , price:        0
          , currency:     'JPY'
        }
        //, shipping_address: {
        //  country_code:     ['JP']
        //  , postal_code:    ''
        //  , phone:          ''
        //  , state:          ''
        //  , city:           ''
        //  , line1:          ''
        //  , line2:          ''
        //  , recipient_name: ''
        //}
        , infomation: {
          name:               ''
        //  first_name:       ''
        //  , last_name:      ''
          , phone:            ''
          , company:          ''
        //  , gender:         ''
        //  , year:           ''
        //  , month:          []
        //  , day:            ''
          , email:            ''
        //  , confirm_email:  ''
          , area:             'domestic'
          , delivery:         'address'
          , payment:          []
          , payment_method:   ''
          , message:          ''
        //  , agreement:      false
          , country_code:     ['JP']
          , postal_code:      ''
          , country:          ''
          , address1:         ''
          , address2:         ''
          , recipient_name:   ''
          , recipient_phone:  ''
          , price:            null
        }
        , credit_validate: {
          custom:           ''
          , receiver_email: ''
          , mc_gross:       0
          , mc_currency:    ''
        }
      }
    };
  }
  
  reduce(state, action) {
    switch (action.type) { 
      case 'config/rehydrate':
        return action.state;
      case 'item/create/credit':
        return Object.assign({}, state, {
          results:    action.results
          , options:  action.options
        });
      case 'item/create/express':
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
          results:    action.results
          , length:     action.length
          , weight:   action.weight
          , from:     action.from
          , shipping: action.shipping
        });
      case 'config/fetch/currency':
        return Object.assign({}, state, {
          results:    action.results
          , usd:      action.usd
          , jpy:    action.jpy
          , currency: action.currency
        });
      default: 
        return state; 
    } 
  } 
}
export default AppStore;

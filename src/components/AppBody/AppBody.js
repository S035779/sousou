import React      from 'react';
import ReactDOM   from 'react-dom'
import AppAction  from 'Actions/AppAction';
import Credit     from 'Components/Credit/Credit';
import Modal      from 'Components/ModalDialog/ModalDialog';
import Radio      from 'Components/Radio/Radio';
import Notice     from 'Components/Notice/Notice';
import std        from 'Utilities/stdutils';
import { log }    from 'Utilities/webutils';
import ini        from 'Utilities/config';

const env = process.env.NODE_ENV || 'development';
const redirect_url_jp = process.env.REDIRECT_URL_JP;
const canceled_url_jp = process.env.CANCELED_URL_JP;
const redirect_url_en = process.env.REDIRECT_URL_EN;
const canceled_url_en = process.env.CANCELED_URL_EN;

let isDebug;
if(env === 'development') isDebug = true
else isDebug = false;

const pspid = 'AppBodyView';

class AppBody extends React.Component {
  constructor(props) {
    super(props);
    const { usd, jpy, options, results } = props;
    const { infomation, details, item, shipping_address } = options;
    this.price = {
      payment: {
        total:              options.total
      , total_currency:     options.currency
      , subtotal:           details.subtotal
      , shipping:           details.shipping
      , shipping_discount:  details.shipping_discount
      , name:               item.name
      , description:        item.description
      , price:              item.price
      }
    , display:            infomation.price
    };
    this.state = {
      currency:           item.currency
      , quantity:         item.quantity
      , name:             infomation.name
      , phone:            infomation.phone
      , company:          infomation.company
      , email:            infomation.email
      , area:             infomation.area
      , delivery:         infomation.delivery
      , payment:          infomation.payment
      , payment_method:   infomation.payment_method
      , message:          infomation.message
      , country_code:     infomation.country_code
      , postal_code:      infomation.postal_code
      , country:          infomation.country !== ""
        ? infomation.country
        : props.language === 'jp' ? '日本' : 'Japan'
      , address1:         infomation.address1
      , address2:         infomation.address2
      , address3:         ''
      , recipient_name:   infomation.recipient_name
      , recipient_phone:  infomation.recipient_phone
      , usd:              usd
      , jpy:              jpy
      , results:          results
      , showModalCredit:  false
      , showModalResults: false
      , notice:           ''
      , redirect_url:     ''
    };
  }

  handleClickButton(name, e) {
    if(isDebug) this.logInfo('handleClickButton');
    switch(name) {
      case 'close':
        this.setState({ showModalCredit: false });
        parent.location.href
          = this.isLangJp() ? canceled_url_jp : canceled_url_en;
        break;
      case 'credit':
        this.setState({ showModalCredit: false });
        parent.location.href
          = this.isLangJp() ? canceled_url_jp : canceled_url_en;
        break;
      case 'results':
        this.setState({ results: null, showModalResults: false });
        parent.location.href = this.state.redirect_url;
        break;
    }
  }

  handleChangeText(name, e) {
    let newState = {};
    switch(name) {
      case 'name':
        newState = {
          name: e.target.value
        , recipient_name: e.target.value
        };
        break;
      case 'phone':
        newState = {
          phone: e.target.value
        , recipient_phone: e.target.value
        };
        break;
      case 'postal_code':
        newState = {
          postal_code: e.target.value
        , address1: document.getElementById('address1').value
        , address2: document.getElementById('address2').value
        };
        break;
      case 'address1':
      case 'address3':
        newState = {
          address1: e.target.value
        , address2: this.isDomestic(this.state) ? '' : ' '
        , address3: e.target.value
        };
        break;
      default:
        newState[name] = e.target.value;
        break;
    }
    this.setState(newState);
  }

  handleFocusText(name, e) {
    let newState = {};
    switch(name) {
      case 'postal_code':
      case 'address1':
      case 'address2':
      case 'address3':
        newState = {
          address1: document.getElementById('address1').value
        , address2: document.getElementById('address2').value
        , address3: document.getElementById('address1').value
          + document.getElementById('address2').value
        };
        this.setState(newState);
        break;
    }
  }

  handleChangeRadio(name, e) {
    const isLangJp = this.isLangJp();
    let newState = {};
    let newAddress = {};
    let newCountry = {};
    const value = e.target.value;
    newState[name] = value;
    switch(name) {
      case 'area':
        newState['currency']      = value === 'domestic' ? 'JPY' : 'USD';
        newState['country_code']  = value === 'domestic' ? ['JP']  : [];
        newState['country']       =
          value === 'domestic' ? isLangJp ? '日本' : 'Japan' : '';
        newState['delivery']      = 'address';
        newAddress = this.setAddress('', isLangJp);
        this.setState(Object.assign({}, newAddress, newState));
        break;
      case 'delivery':
        newAddress = this.setAddress(value, isLangJp);
        this.setState(Object.assign({}, newState, newAddress));
        break;
      default:
        this.setState(newState);
        break;
    }
  }

  handleChangeSelect(name, e) {
    const isLangJp = this.isLangJp();
    let newState = {};
    let newPayment = {};
    let options = e.target.options;
    let values = [];
    for( let i=0; i<options.length; i++) {
      if(options[i].selected) values.push(options[i].value);
    }
    newState[name] = values;
    switch(name) {
      case 'quantity':
        const { length, weight, from } = this.props;
        AppAction.fetchShipping({
          length: length * Number(values.join())
        , weight: weight * Number(values.join())
        , from
        });
        this.setState(newState);
        break;
      case 'country_code':
        const newCountry = this.setCountry(values.join(),isLangJp);
        this.setState(Object.assign({}, newState, newCountry));
        break;
      case 'payment':
        newPayment = this.setPayment(values.join(), isLangJp);
        this.setState(Object.assign({}, newState, newPayment));
      default:
        this.setState(newState);
        break;
    }
  }

  handleSubmit(e) {
    if(isDebug) this.logInfo('handleSubmit');
    if(!this.isValid(this.state)) return;
    e.preventDefault();
    if(this.isCredit(this.state)) {
      this.setState({ showModalCredit: true });
      window.location.href = '#';
    } else {
      const newOptions = this.setOptions(this.state, this.price);
      AppAction.createMessage(newOptions);
    }
    if(isDebug) this.logTrace(this.price);
  }

  setConfirm(shipping, state, isLangJp) {
    const value
      = this.isValid(state) ? this.isConfirm(shipping, state) : '';
    let confirm = '';
    switch(value) {
      case 0:
        confirm = this.translate('notes_confirm_0', isLangJp);
        break;
      case 1:
        confirm = this.translate('notes_confirm_1', isLangJp);
        break;
      case 2:
        confirm = this.translate('notes_confirm_2', isLangJp);
        break;
      case 3:
        confirm = this.translate('notes_confirm_3', isLangJp);
        break;
      default:
        confirm = this.translate('notes_confirm_default', isLangJp);
        break;
    }
    return confirm;
  }

  setNotice(state, isLangJp) {
    // this.logTrace(`${this.isCredit(state)} ${this.isPayPal(state)}`);
    const value = this.isValid(state) ? state.payment.join() : '';
    let notice = '';
    switch(value) {
      case 'deposit':
        notice = this.translate('notes_notice_deposit', isLangJp);
        break;
      case 'paypal':
        notice = this.translate('notes_notice_paypal', isLangJp);
        break;
      case 'cash':
        notice = this.translate('notes_notice_cash', isLangJp);
        break;
    }
    return notice;
  }

  setResults(results, isLangJp) {
    let head, body = '';
    if (results && results.accepted) {
      head = this.translate('results_head', isLangJp);
      body = this.translate('results_body', isLangJp);
    } else if (results && results.error) {
      head = results.error.name;
      body = std.is('Object', results.error.message)
        ? isLangJp
          ? results.error.message.jp : results.error.message.en
        : results.error.message;
    } 
    return { head, body };
  }

  setOptions(state, { payment, display }) {
    const isLangJp = this.isLangJp();
    const isSite = isLangJp ? 'ja_JP' : 'en_US';
    const shipping_address = this.setShippingAddress('ja_JP', isLangJp);
    return Object.assign({}, this.props.options, {
      total:      payment.total
      , currency: payment.total_currency
      , details: {
        subtotal:             payment.subtotal
        , shipping:           payment.shipping
        , shipping_discount:  payment.shipping_discount
      }
      , item: {
        name:           payment.name
        , description:  payment.description
        , quantity:     state.quantity
        , price:        payment.price
        , currency:     state.currency
      }
      , shipping_address
      , infomation: {
        name:              state.name
        , phone:           state.phone
        , company:         state.company
        , email:           state.email
        , area:            state.area
        , delivery:        state.delivery
        , payment:         state.payment
        , payment_method:  state.payment_method
        , message:         state.message
        , country_code:    state.country_code
        , postal_code:     state.postal_code
        , country:         state.country
        , address1:        state.address1
        , address2:        state.address2
        , recipient_name:  state.recipient_name
        , recipient_phone: state.recipient_phone
        , site:            isSite
        , price:           display
      }
    });
  }

  setShippingAddress(value, isLangJp) {
    let newAddress = {};
    newAddress['ja_JP'] = {
      country_code:     [ 'JP' ]
      , postal_code:    isLangJp ? '135-0046' : '135-0046'
      , state:          isLangJp ? '東京都'
                                 : 'TOKYO'
      , city:           isLangJp ? '江東区 牡丹'
                                 : 'Koto-ku, Botan'
      , line1:          isLangJp ? '1-2-2'
                                 : 'Address 1-2-2'
      , line2:          isLangJp ? '東京オフィス'
                                 : 'TOKYO OFFICE'
      , phone:          isLangJp ? '03-5875-8402'
                                 : '03-5875-8402'
      , recipient_name: isLangJp ? '...'
                                 : '...'
    };
    newAddress['en_US'] = {
      country_code:     [ 'MM' ]
      , postal_code:    '11181'
      , state:          'YANGON'
      , city:           'Kamayut Tsp'
      , line1:          'Hledan Center, #307, 3rd Floor'
      , line2:          'MYANMER OFFICE'
      , phone:          '+95 94-5210-2233'
      , recipient_name: '...'
    };
    return value === 'ja_JP' || value === 'en_US'
      ? newAddress[value]
      : { country_code:   [ 'JP' ]
        , postal_code:    ''
        , state:          ''
        , city:           ''
        , line1:          ''
        , line2:          ''
        , phone:          ''
        , recipient_name: ''
      };
  }

  setAddress(value, isLangJp) {
    let newAddress = {};
    newAddress['japan'] = {
      country_code:  [ 'JP' ]
      , postal_code: isLangJp ? '135-0046' : '135-0046'
      , country:     isLangJp ? '日本' : 'Japan'
      , address1:    isLangJp ? '東京都 江東区 牡丹'
                              : 'TOKYO, Koto-ku, Botan'
      , address2:    isLangJp ? '1-2-2 東京オフィス'
                              : 'Address 1-2-2, TOKYO OFFICE'
      , address3:    isLangJp
        ? '135-0046 東京都 江東区 牡丹 1-2-2 東京オフィス'
        : '135-0046 TOKYO, Koto-ku, Botan, Address 1-2-2, TOKYO OFFICE'
    };
    newAddress['myanmer'] = {
      country_code:   [ 'MM' ]
      , postal_code:  '11181'
      , country:      'Myanmar'
      , address1:     'YANGON, Kamayut Tsp'
      , address2:     'Hledan Center, #307, 3rd Floor, MYANMER OFFICE'
      , address3:
        '11181 YANGON, Kamayut Tsp, Hledan Center, #307, 3rd Floor'
          + ', MYANMER OFFICE'
    };
    return value === 'japan' || value === 'myanmer'
      ? newAddress[value]
      : { country_code: [ 'JP' ]
        , postal_code:  ''
        , country:      isLangJp ? '日本' : 'Japan'
        , address1:     ''
        , address2:     ''
        , address3:     ''
      };
  }

  setCountry(value, isLangJp) {
    const shipping = this.props.shipping;
    const ems =  shipping.ems.filter(obj => obj.code_2 === value);
    return value
      ? { country: isLangJp ? ems[0].name_jp : ems[0].name_en }
      : { country: '' };
  }

  setPayment(value, isLangJp) {
    let newPayment = {};
    newPayment['paypal'] = {
      payment_method: this.translate('select_payment_paypal', isLangJp)
    };
    newPayment['deposit'] = {
      payment_method: this.translate('select_payment_deposit', isLangJp)
    };
    newPayment['cash'] = {
      payment_method: this.translate('select_payment_cash', isLangJp)
    };
    return value === 'paypal' || value === 'deposit' || value === 'cash' 
      ? newPayment[value] : { payment_method: '' };
  }

  componentWillReceiveProps(nextProps) {
    //log.trace(nextProps);
    if(nextProps.results) {
      if(nextProps.results.accepted
      && nextProps.results.accepted[0] === this.state.email) {
        this.setState({
          results: nextProps.results
        , showModalResults: true
        , redirect_url:
            this.isLangJp() ? redirect_url_jp : redirect_url_en
        });
      } else if(nextProps.results.error) {
        this.setState({
          results: nextProps.results
        , showModalResults: true
        , redirect_url:
            this.isLangJp() ? canceled_url_jp : canceled_url_en
        });
      }
      window.location.href = '#';
    }
    if(nextProps.jpy || nextProps.usd) 
      this.setState({ usd: nextProps.usd, jpy: nextProps.jpy });
  }

  componentDidMount(prevProps, prevState) {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    const el = this.el = document.createElement('div');
    el.setAttribute('id','paypal-button');
    buttonNode.appendChild(el);
  }

  componentWillUpdate(props, state) {
    if(!this.isValid(state)) return;
    this.setPrice(props, state);
  }

  setPrice(props, state) {
    const { shipping, currency } = props;
    const isDm        = this.isDomestic(state);
    const isUSD       = this.isUSD(state);
    const newPrice    = this.isPrice(currency, state, isDm);
    const newShipping = this.isShipping(shipping, currency, state, isDm);
    const newDiscount = this.isDiscount(newShipping, state);
    const newSubTotal = this.isSubTotal(newPrice, state);
    const newTotal
      = this.isTotal(newSubTotal, newShipping, newDiscount);
    this.price = {
      payment: {
        price:                isUSD ? newPrice.usd    : newPrice.jpy
        , shipping:           isUSD ? newShipping.usd : newShipping.jpy
        , shipping_discount:  isUSD ? newDiscount.usd : newDiscount.jpy
        , subtotal:           isUSD ? newSubTotal.usd : newSubTotal.jpy
        , total:              isUSD ? newTotal.usd    : newTotal.jpy
        , total_currency:     isUSD ? 'USD'           : 'JPY'
        , name:               'Myanmar Companies YearBook Vol.1'
        , description:        'Myanmar Companies Yearbook'
      }
      , display: {
        price:                isDm  ? newPrice.jpy    : newPrice.usd
        , shipping:           isDm  ? newShipping.jpy : newShipping.usd
        , shipping_discount:  isDm  ? newDiscount.jpy : newDiscount.usd
        , subtotal:           isDm  ? newSubTotal.jpy : newSubTotal.usd
        , total:              isDm  ? newTotal.jpy    : newTotal.usd   
        , total_currency:     isDm  ? 'JPY'           : 'USD'
        , name:               'Myanmar Companies YearBook Vol.1'
        , description:        'Myanmar Companies Yearbook'
      }
    };
    //this.logTrace(this.price);
  }

  componentDidUpdate(prevProps, prevState) {
    this.componentWillUnmount();
    this.componentDidMount();
    if(!this.isValid(this.state)) return;

    if(this.isPayPal(this.state)) {
      const newOptions = this.setOptions(this.state, this.price);
      AppAction.createExpress(newOptions);
      //this.logTrace(this.price);
    }
  }

  componentWillUnmount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    buttonNode.removeChild(this.el);
  }

  isPrice(currency, state, isDomestic) {
    const usd = isDomestic
      ? Math.ceil((state.jpy / currency.USDJPY) * 100) / 100
      : Number(state.usd);
    const jpy = isDomestic
      ? Number(state.jpy)
      : Math.ceil(currency.USD);
    return { usd, jpy };
  }

  isShipping(shipping, currency, state, isDomestic) {
    const isJpp = obj => shipping.jpp.filter(jpp =>
      std.regexWord(jpp.name_jp, obj.address1.toUpperCase())
        || std.regexWord(jpp.name_en, obj.address1.toUpperCase()))[0];
    const isEms = obj => shipping.ems.filter(ems =>
      ems.code_2 === obj.country_code.join()
      && (ems.ems1 === 'OK' || ems.ems2_1 === 'OK' ||
        ems.ems2_2 === 'OK' || ems.ems3   === 'OK') )[0];
    const isPpl = obj => shipping.ems.filter(ems =>
      ems.code_2 === obj.country_code.join() && ems.paypal === 'OK' )[0];
    const isCfm = this.isConfirm(shipping, state);
    const usd = isDomestic
      ? isJpp(state)
        ? Math.ceil((isJpp(state).price / currency.USDJPY) * 100) / 100
        : 0
      : isEms(state) && isPpl(state) && isCfm
        ? Number(isEms(state).price)
        : 0;
    const jpy = isDomestic
      ? isJpp(state)
        ? Number(isJpp(state).price)
        : 0
      : isEms(state) && isPpl(state) && isCfm
        ? Math.ceil(isEms(state).price * currency.USDJPY)
        : 0;
    return { usd, jpy };
  }

  isDiscount(shipping_price, state) {
    const { delivery } = state;
    const isDlv = delivery === 'myanmer' || delivery === 'japan';
    const usd = isDlv ? shipping_price.usd * -1 : 0;
    const jpy = isDlv ? shipping_price.jpy * -1 : 0;
    return { usd, jpy }
  }

  isSubTotal(price, state) {
    const usd = price.usd * state.quantity.join();
    const jpy = price.jpy * state.quantity.join();
    return { usd, jpy };
  }

  isTotal(subtotal, shipping_price, discount) {
    const usd = subtotal.usd + shipping_price.usd + discount.usd;
    const jpy = subtotal.jpy + shipping_price.jpy + discount.jpy;
    return { usd, jpy };
  }

  isConfirm(shipping, state) {
    const o = shipping.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0];
    switch(o.fwp) {
      case 'NG':          return 0;
      case 'OK':          return 1;
      case 'RC':          return 2;
      case 'NA': default: return 3;
    }
  }

  isLangJp() {
    return this.props.language === 'jp';
  }

  isCredit(state) {
    return (
         !this.isMail(state)
      && !this.isUSD(state)
      &&  this.isQuantity(state)
      && (this.price.payment.shipping !== 0 || this.isOffice(state))
    );
  }

  isPayPal(state) {
    return (
         !this.isMail(state)
      &&  this.isUSD(state)
      &&  this.isQuantity(state)
      && (this.price.payment.shipping !== 0 || this.isOffice(state))
    );
  }

  isOffice(state) {
    return state.delivery === 'japan' || state.delivery === 'myanmer';
  }

  isDomestic(state) {
    return state.area === 'domestic';
  }

  isUSD(state) {
    return state.currency === 'USD';
  }

  isMail(state) {
    const payment = state.payment ? state.payment.join() : '';
    return payment !== 'paypal';
  }

  isQuantity(state) {
    const quantity = state.quantity ? Number(state.quantity.join()) : 0;
    return quantity > 0 && quantity < 11;
  }

  isValid(state) {
    return (
         state.name
      && state.phone          && !this.isNotPhone(state.phone)
      && state.email          && !this.isNotEmail(state.email)
      && state.country_code   && (state.country_code.join() !== '')
      && state.address1
      && state.address2
      && state.address3
      && state.quantity       && (state.quantity.join() !== '')
      && state.currency
      && state.payment        && (state.payment.join() !== '')
    );
  }

  isNotEmail(val) {
    return !std.regexEmail(val);
  }

  isNotPhone(val) {
    return !std.regexNumber(val);
  }

  renderSelect(objs, key, value) {
    if(!objs) return null;
    const opts = objs.filter(opt => opt.disable ? false : true)
      .map(obj => ({ key: obj[key], val: obj[value] }))
    return opts.map((opt, idx) => (
        <option key={"choice-" + idx} value={opt.val}>{opt.key}</option>
    ));
  }

  renderSelectCountry(objs, isDomestic, isJP) {
    const opts_country = [{
        name_en: 'Japan'
        , name_jp: '日本'
        , code_2: 'JP'
        , disable: isDomestic ? false : true
      },{
        name_en: 'Myanmar'
        , name_jp: 'ミャンマー'
        , code_2: 'MM'
      },{
        name_en: 'Thailand'
        , name_jp: 'タイ'
        , code_2: 'TH'
      },{
        name_en: 'China'
        , name_jp: '中華人民共和国 (中国)'
        , code_2: 'CN'
      },{
        name_en: 'Singapore'
        , name_jp: 'シンガポール'
        , code_2: 'SG'
      },{
        name_en: 'Malaysia'
        , name_jp: 'マレーシア'
        , code_2: 'MY'
      },{
        name_en: 'Taiwan'
        , name_jp: '台湾'
        , code_2: 'TW'
      },{
        name_en: 'Hong Kong'
        , name_jp: '香港'
        , code_2: 'HK'
      },{
        name_en: 'Vietnum'
        , name_jp: 'ベトナム'
        , code_2: 'VN'
      },{
        name_en: 'Korea'
        , name_jp: '大韓民国 (韓国)'
        , code_2: 'KR'
    }];
    const codes = opts_country.map(obj => obj.code_2);
    const isCode = obj => codes.some(code => code === obj);
    const newObjs = objs ? objs.filter(obj => !isCode(obj.code_2)) : [];
    return objs
      ? isJP
        ? this.renderSelect(
          opts_country.concat(
            std.sortObjUni(newObjs,'name_jp')
          )
        , 'name_jp', 'code_2') 
        : this.renderSelect(
          opts_country.concat(
            std.sortObjStr(newObjs,'name_en')
          )
        , 'name_en', 'code_2')
      : null;
  }

  renderSelectPayment(isDomestic, isJP) {
    const opts_payment = [{
        name_en: ini.translate['select_payment_paypal'].en
      , name_jp: ini.translate['select_payment_paypal'].ja
      , value: 'paypal'
      }
      , {
        name_en: ini.translate['select_payment_deposit'].en
      , name_jp: ini.translate['select_payment_deposit'].ja
      , value: 'deposit'
      , disable: isDomestic ? false : true
      }
      , {
        name_en: ini.translate['select_payment_cash'].en
      , name_jp: ini.translate['select_payment_cash'].ja
      , value: 'cash'
    }];
    return isJP
      ? this.renderSelect(opts_payment, 'name_jp', 'value')
      : this.renderSelect(opts_payment, 'name_en', 'value')
  }

  renderButton(state) {
    if (  this.isMail(state)
      ||  this.isCredit(state)
      || !this.isQuantity(state)
      || !this.isValid(state)
      || (this.price.payment.shipping === 0 && !this.isOffice(state))) {
      return <input type="submit"
        value={ this.translate('button_primary_send', this.isLangJp()) }
        className="button-primary" />
    } else {
      return <div></div>;
    }
  }

  logInfo(message) {
    log.info(`${pspid}>`, 'Request:', message);
  }
   
  logTrace(message) {
    log.trace(`${pspid}>`, 'Response:', message);
  }
   
  logError(error) {
    log.error(`${pspid}>`, error.name, ':', error.message);
  }

  translate(label, isJP) {
    return isJP ? ini.translate[label].ja : ini.translate[label].en;
  }
    
  render() {
    if(isDebug) this.logTrace(this.state);
    if(isDebug) this.logTrace(this.price);
    const { shipping, language } = this.props;
    const isJP              =this.isLangJp();
    const isJPY             =this.state.currency === 'JPY';
    const isDomestic        =this.state.area === 'domestic';
    const isDelivery        =this.state.delivery === 'address';
    const isPayPal          =this.state.payment.join() === 'paypal';
    const isCash            =this.state.payment.join() === 'cash';
    const Delivery          =this.translate('Delivery',           isJP);
    const Area              =this.translate('Area',               isJP);
    const Quantity          =this.translate('Quantity',           isJP);
    const Currency          =this.translate('Currency',           isJP);
    const Payment           =this.translate('Payment',            isJP);
    const name              =this.translate('user_name',          isJP);
    const company           =this.translate('user_company',       isJP);
    const phone             =this.translate('user_phone',         isJP);
    const email             =this.translate('user_email',         isJP);
    const country_code      =this.translate('user_country_code',  isJP);
    const postal_code       =this.translate('user_postal_code',   isJP);
    const address1          =this.translate('user_address1',      isJP);
    const address2          =this.translate('user_address2',      isJP);
    const address3          =this.translate('user_address3',      isJP);
    const recipient_name    =this.translate('user_recipient_name',isJP);
    const recipient_phone   =this.translate('user_recipient_phone',isJP);
    const quantity          =this.translate('user_quantity',      isJP);
    const quantity_other    =this.translate('user_quantity_other',isJP);
    const currency          =isJPY
      ? isJP
        ? Number(this.state.jpy).toLocaleString('ja-JP') + ' 円'
        : 'JPY ' + Number(this.state.jpy).toLocaleString('ja-JP')
      : 'US ' + Number(this.state.usd).toLocaleString('en-US'
          , { style: 'currency', currency: 'USD' });
    const payment           =this.translate('user_payment',       isJP); 
    const message           =this.translate('user_message',       isJP); 
    const area_domestic     =this.translate('area_domestic',      isJP); 
    const area_oversea      =this.translate('area_oversea',       isJP); 
    const delivery_address  =this.translate('delivery_address',   isJP); 
    const delivery_japan    =this.translate('delivery_japan',     isJP); 
    const delivery_myanmer  =this.translate('delivery_myanmer',   isJP); 
    const delivery_check    =this.translate('delivery_check',     isJP); 
    const label_quantity    =this.translate('label_quantity',     isJP); 
    const label_currency    =this.translate('label_currency',     isJP); 
    const label_currency_usd=this.translate('label_currency_usd', isJP); 
    const label_currency_jpy=this.translate('label_currency_jpy', isJP); 
    const notes_delivery    =this.translate('notes_delivery',     isJP);
    const notes_currency_usd=!isDomestic && !isCash
      ? this.translate('notes_currency_usd', isJP) : '';
    const notes_currency_jpy=isJP
      ? 'US ' + Number(this.state.usd).toLocaleString('en-US'
          , { style: 'currency', currency: 'USD' })
        + this.translate('notes_currency_jpy', isJP)
      : 'US ' + Number(this.state.usd).toLocaleString('en-US'
          , { style: 'currency', currency: 'USD' })
        + this.translate('notes_currency_jpy', isJP);
    const notes_payment1    =!isDomestic && isPayPal
      ? this.translate('notes_payment1', isJP) : '';
    const notes_payment2    =!isDomestic && isPayPal
      ? this.translate('notes_payment2', isJP) : '';
    const notes_notice      =this.setNotice(this.state, isJP); 
    const notes_confirm     =this.setConfirm(shipping,this.state, isJP);
    const select_country    =
      this.renderSelectCountry(shipping.ems, isDomestic, isJP);
    const select_payment    =this.renderSelectPayment(isDomestic, isJP);
    const toggledButton     =this.renderButton(this.state);
    const results           =this.setResults(this.state.results, isJP);
    const showModalCredit   =!!this.state.showModalCredit;
    const showModalResults  =!!this.state.showModalResults;
    const newOptions        =this.setOptions(this.state, this.price);

    return <div className="buynow_contactlast">
      <form id="user-sign-up" onSubmit={this.handleSubmit.bind(this)}>
      {/* Your Informatin */}
      <fieldset className="category-group">
        <table><tbody>
        <tr>
          <td>
          <input type="text" name="name" id="name"
            value={this.state.name}
            onChange={this.handleChangeText.bind(this, 'name')}
            placeholder={name}
            className="add-placeholder required"/>
          </td>
        </tr>
        <tr>
          <td>
          <input type="text" name="company" id="company"
            onChange={this.handleChangeText.bind(this, 'company')}
            placeholder={company}
            className="add-placeholder"/>
          </td>
        </tr>
        <tr>
          <td>
          <input type="text" name="phone" id="phone"
            value={this.state.phone}
            onChange={this.handleChangeText.bind(this, 'phone')}
            placeholder={phone}
            className="add-placeholder required"/>
          </td>
        </tr>
        <tr>
          <td>
          <input type="text" name="email" id="email"
            onChange={this.handleChangeText.bind(this, 'email')}
            className="add-placeholder required"
            placeholder={email}/>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Your Informatin */}

      {/* Your Delivery Address */}
      <fieldset className="category-group">
        <legend>{Area}</legend>
        <table><tbody>
        <tr>
        <th>
        </th>
        <td>
          <div className="area-field">
          <Radio name="area"
            value={this.state.area}
            onChange={this.handleChangeRadio.bind(this, 'area')}>
            <option value="domestic"
              id="area_domestic"> {area_domestic} </option>
            <option value="oversea"
              id="area_oversea"> {area_oversea} </option>
          </Radio>
          </div>
        </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Your Shipping Address */}

      {/* Payment */}
      <fieldset className="category-group">
        <legend>{Payment}</legend>
        <table><tbody>
        <tr>
          <td>
          <div>
          <select name="payment" id="payment"
            multiple={false}
            value={this.state.payment}
            onChange={this.handleChangeSelect.bind(this, 'payment')}
            className="middle-field required">
          <option value="">{payment}</option>
          {select_payment}
          </select>
          </div>
          <span className="notes" style={{ color: 'red' }}>
            {notes_payment1}</span>
          <span className="notes" style={{ color: 'red' }}>
            {notes_payment2}</span>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* How to buy */}

      {/* Quantity */}
      <fieldset className="category-group">
        <legend>{Quantity}</legend>
        <table><tbody>
        <tr>
          <td>
          <div className="multi-quantity-field">
          <span className="quantity-field">
          <select name="quantity" id="quantity"
            multiple={false}
            value={this.state.quantity}
            onChange={this.handleChangeSelect.bind(this, 'quantity')}
            className="short-field required">
          <option value="">{quantity}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">{quantity_other}</option>
          </select>
          <label>{label_quantity}</label>
          </span>
          <span className="quantity-field">
          <label>{currency}</label>
          <label>{label_currency}</label>
          </span>
          </div>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Quantity */}

      {/* Currency */}
      <div className={isDomestic ? 'hide' : 'no-hide'}>
      <fieldset className="category-group">
        <legend>{Currency}</legend>
        <table><tbody>
        <tr>
          <td>
          <div className="currency-field">
          <Radio name="currency"
            value={this.state.currency}
            onChange={this.handleChangeRadio.bind(this, 'currency')}>
            <option value="USD"
              id="currency_usd"> {label_currency_usd} <span
              className="notes"> {notes_currency_usd}</span></option>
            <option value="JPY"
              id="currency_jpy"> {label_currency_jpy} <span
              className="notes"> {notes_currency_jpy}</span></option>
          </Radio>
          </div>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      </div>
      {/* Currency */}

      {/* Delivery */}
      <fieldset className="category-group">
        <legend>{Delivery}</legend>
        <table><tbody>
        <tr>
          <td>
          <div className="delivery-field">
          <Radio name="delivery"
            value={this.state.delivery}
            onChange={this.handleChangeRadio.bind(this, 'delivery')}>
            <option value="address"
              id="delivery_address"> {delivery_address} </option>
            <option value="japan"
              classes={!isDomestic ? 'hide' : 'no-hide'}
              disabled={!isDomestic}
              id="delivery_japan"> {delivery_japan} </option>
            <option value="myanmer"
              classes={isDomestic ? 'hide' : 'no-hide'}
              disabled={isDomestic}
              id="delivery_myanmer"> {delivery_myanmer} </option>
          </Radio>
          </div>
          <span className="notes">{notes_delivery}</span>
          </td>
          <td>
          <a className="btn btn-default" href="#"
              data-featherlight="#fl1">{delivery_check}</a>
          </td>
        </tr>
        </tbody></table>
      <div className={isDomestic || !isDelivery ? 'hide' : 'no-hide'}>
        <table><tbody>
        <tr>
          <td>
          <select name="country_code" id="country_code"
            disabled={!isDelivery}
            multiple={false}
            value={this.state.country_code}
            onChange={this.handleChangeSelect.bind(this, 'country_code')}
            className="required">
          <option value="">{country_code}</option>
          {select_country}
          </select>
          <span className="notes">{notes_confirm}</span>
          </td>
        </tr>
        </tbody></table>
      </div>
      <div className={!isDelivery ? 'hide' : 'no-hide'}>
      <div className={isDomestic ? 'hide' : 'no-hide'}>
        <table><tbody>
        <tr>
          <td>
          <textarea name="address3" id="address3"
            value={this.state.address3}
            cons="40" rows="4"
            onChange={this.handleChangeText.bind(this, 'address3')}
            placeholder={address3}
            className="required add-placeholder"/>
          </td>
        </tr>
        </tbody></table>
      </div>
      <div className={!isDomestic ? 'hide' : 'no-hide'}>
        <table><tbody>
        <tr>
          <td>
          <div className="multi-postal-field">
          <span className="postal-field">
          <input type="text" name="postal_code" id="postal_code"
            value={this.state.postal_code}
            onChange={this.handleChangeText.bind(this, 'postal_code')}
            onFocus={this.handleFocusText.bind(this, 'postal_code')}
            className="short-field add-placeholder"
            placeholder={postal_code} />
          </span>
          <span className="postal-field">
          <input type="text" name="address1" id="address1"
            value={this.state.address1}
            onChange={this.handleChangeText.bind(this, 'address1')}
            onFocus={this.handleFocusText.bind(this, 'address1')}
            placeholder={address1}
            className="middle-field required add-placeholder" />
          </span>
          </div>
          </td>
        </tr>
        <tr>
          <td>
          <input type="text" name="address2" id="address2"
            value={this.state.address2}
            onChange={this.handleChangeText.bind(this, 'address2')}
            onFocus={this.handleFocusText.bind(this, 'address2')}
            placeholder={address2}
            className="required add-placeholder" />
          </td>
        </tr>
        </tbody></table>
      </div>
        <table><tbody>
        <tr>
          <td>
          <input type="text" name="recipient_name" id="recipient_name"
            value={this.state.recipient_name}
            onChange={this.handleChangeText.bind(this, 'recipient_name')}
            onFocus={this.handleFocusText.bind(this, 'recipient_name')}
            placeholder={recipient_name}
            className="add-placeholder"/>
          </td>
        </tr>
        <tr>
          <td>
          <input type="text" name="recipient_phone" id="recipient_phone"
            value={this.state.recipient_phone}
            onChange={this.handleChangeText.bind(this,'recipient_phone')}
            onFocus={this.handleFocusText.bind(this,'recipient_phone')}
            placeholder={recipient_phone}
            className="add-placeholder"/>
          </td>
        </tr>
        </tbody></table>
      </div>
      </fieldset>
      {/* Delivery */}

      {/* Message */}
      <fieldset className="category-group">
        <table><tbody>
        <tr>
          <td>
          <textarea name="message" id="message"
            value={this.state.message}
            cons="40" rows="10"
            onChange={this.handleChangeText.bind(this, 'message')}
            placeholder={message}
            className="add-placeholder"/>
          <span className="notes">{notes_notice}</span>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Message */}

      {/* Confirm */}
      <div id="signup-next">
        {toggledButton}
        <div ref="signup_next"></div>
      </div>
    </form>
    <Modal showModal={showModalResults}>
      <Notice language={language} message={results}
        onCompleted={this.handleClickButton.bind(this, 'results')}/>
    </Modal>
    <Modal showModal={showModalCredit}>
      <Credit language={language} options={newOptions}
        onClose={this.handleClickButton.bind(this, 'close')}
        onCompleted={this.handleClickButton.bind(this, 'credit')}/>
    </Modal>
    </div>;
  }
};
export default AppBody;

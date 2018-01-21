import React from 'react';
import ReactDOM from 'react-dom'
import AppAction from '../../actions/AppAction';
import Credit from '../../components/Credit/Credit';
import Modal from '../../components/ModalDialog/ModalDialog';
import Radio from '../../components/Radio/Radio';
import Notice from '../../components/Notice/Notice';
import std from '../../utils/stdutils';
import { log } from '../../utils/webutils';

const pspid = 'AppBodyView';

class AppBody extends React.Component {
  constructor(props) {
    super(props);
    const usd = props.usd;
    const jpy = props.jpy;
    const options = props.options;
    const results = props.results;
    const infomation = options.infomation;
    const details = options.details;
    const item = options.item;
    const shipping_address = options.shipping_address;

    this.payment = {
      total:            options.total
      , total_currency: options.currency
      , subtotal:       details.subtotal
      , shipping:       details.shipping
      , name:           item.name
      , description:    item.description
      , price:          item.price
    };

    this.state = {
      currency:         item.currency
      , quantity:       item.quantity
      , recipient_name: shipping_address.recipient_name
      , line1:          shipping_address.line1
      , line2:          shipping_address.line2
      , city:           shipping_address.city
      , country_code:   shipping_address.country_code
      , postal_code:    shipping_address.postal_code
      , phone:          shipping_address.phone
      , state:          shipping_address.state
      , first_name:     infomation.first_name
      , last_name:      infomation.last_name
    //  , gender:         infomation.gender
    //  , year:           infomation.year
    //  , month:          infomation.month
    //  , day:            infomation.day
      , email:          infomation.email
    //  , confirm_email:  infomation.confirm_email
      , area:           infomation.area
      , delivery:       infomation.delivery
      , payment:        infomation.payment
    //  , agreement:      infomation.agreement
      , message:        infomation.message
      , usd:            usd
      , jpy:            jpy
      , results:        results
      , showModalCredit:  false
      , showModalResults:  false
      , notice:         ''
    };
  }

  handleClickClose(name, e) {
    //this.logInfo('handleClickClose');
    switch(name) {
      case 'credit':
        this.setState({ showModalCredit: false });
      default:
        break;
    }
  }

  handleClickButton(name, e) {
    //this.logInfo('handleClickButton');
    switch(name) {
      case 'credit':
        this.setState({ showModalCredit: false });
        break;
      case 'results':
        this.setState({ results: null, showModalResults: false });
        break;
      default:
        break;
    }
  }

  handleChangeText(name, e) {
    let newState = {};
    switch(name) {
      case 'postal_code':
        newState ={
          postal_code: e.target.value
          , state:    document.getElementById('state').value
          , city:   document.getElementById('city').value
          , line1:  document.getElementById('line1').value
          , line2:  document.getElementById('line2').value
          , recipient_name:
                    document.getElementById('recipient_name').value
        };
        this.setState(newState);
        break;
      default:
        newState[name] = e.target.value;
        this.setState(newState);
        break;
    }
  }

  handleFocusText(name, e) {
    let newState = {};
    switch(name) {
      default:
        newState ={
          state:    document.getElementById('state').value
          , city:   document.getElementById('city').value
          , line1:  document.getElementById('line1').value
          , line2:  document.getElementById('line2').value
          , recipient_name:
                    document.getElementById('recipient_name').value
        };
        this.setState(newState);
        break;
    }
  }

  handleChangeCheckbox(name, e) {
    let newState = {};
    switch(name) {
      default:
        newState[name] = e.target.checked;
        this.setState(newState);
        break;
    }
  }

  handleChangeRadio(name, e) {
    let newState = {};
    switch(name) {
      case 'delivery':
        newState[name] = e.target.value;
        const newAddress
          = this.setShippingAddress(e.target.value, this.isLangJp());
        this.setState(Object.assign({}, newState, newAddress));
        break;
      default:
        newState[name] = e.target.value;
        this.setState(newState);
        break;
    }
  }

  handleChangeSelect(name, e) {
    let newState = {};
    let options = e.target.options;
    let values = [];
    for( let i=0; i<options.length; i++) {
      if(options[i].selected) values.push(options[i].value);
    }
    switch(name) {
      //case 'country_code':
      //  newState[name] = values;
      //  const shipping = this.props.shipping;
      //  const newCountry
      //    = this.setShippingCountry(values.join()
      //      , this.props.shipping, this.isLangJp());
      //  this.setState(Object.assign({}, newState, newCountry));
      //  break;
      default:
        newState[name] = values;
        this.setState(newState);
        break;
    }
  }

  handleSubmit(e) {
    //this.logInfo('handleSubmit');
    e.preventDefault();
    const state = this.state;
    if(!this.isValid(state)) return;
    if(this.isCredit(state)) {
      this.setState({ showModalCredit: true });
    } else {
      const options = this.setOptions(state, this.payment);
      AppAction.createMessage(options);
    }
    this.logTrace(this.payment);
  }

  setConfirm(shipping, state, isLangJp) {
    if(!this.isValid(state)) return '';
    const value = this.isConfirm(shipping, state);
    let confirm = '';
    switch(value) {
      case 0:
        confirm = isLangJp
          ? '弊社未対応エリアの為、別途ご連絡差し上げます。'
          : 'For our unsupported area, we will contact you separately.';
        break;
      case 1:
        confirm = isLangJp
          ? '弊社対応可能エリアです。'
          : 'It is an area that we can handle.';
        break;
      case 2: case 3: default:
        confirm = isLangJp
          ? '弊社未対応エリアの場合は、別途ご連絡差し上げます。'
          : 'In the case of our unsupported area,' 
            + 'we will contact you separately.';
        break;
    }
    return confirm;
  }

  setNotice(state, isLangJp) {
    if(!this.isValid(state)) return '';
    const value = this.state.payment.join();
    let notice = '';
    switch(value) {
      case 'paypal':
        notice = isLangJp
          ? this.isCredit(state) || this.isPayPal(state)
            ? 'EMS、PayPal対応エリアです。'
            : 'EMSまたはPayPal未対応エリアの為、別途ご連絡差し上げます。'
          : this.isCredit(state) || this.isPayPal(state)
            ? 'It is an EMS or PayPal compatible area.'
            : 'It is an area not compliant with EMS or PayPal. ';
        break;
      case 'deposit':
        notice = isLangJp
          ? '銀行振り込み方法について、別途ご連絡差し上げます。'
          : 'For bank transfer method, details will be contacted'
            + ' separately.';
        break;
      case 'other':
        notice = isLangJp
          ? '購入数指定、支払い方法について、記入してください。'
          : 'Please contact us separately for number of entries and'
            + 'payment method.';
        break;
      default:
        break;
    }
    return notice;
  }

  setResults(results, isLangJp) {
    let head, body = '';
    if (results && results.accepted) {
      head = isLangJp
        ? 'ご利用ありがとうございました！'
        : 'Thank you for using!';
      body = isLangJp
        ? 'ご依頼の商品の詳細は別途メールにてご連絡させて頂きます。'
        : 'Details of the requested item will be notified separately'
          + 'by e-mail.';
    } else if (results && results.error) {
      head = results.error.name;
      body = std.is('Object', results.error.message)
        ? isLangJp
          ? results.error.message.jp : results.error.message.en
        : results.error.message;
    } 
    return { head, body };
  }

  setOptions(state, payment) {
    return Object.assign({}, this.props.options, {
      total:          payment.total
      , currency:       payment.total_currency
      , details: {
        subtotal:       payment.subtotal
        , shipping:     payment.shipping
      }
      , item: {
        name:           payment.name
        , description:  payment.description
        , quantity:     state.quantity
        , price:        payment.price
        , currency:     state.currency
      }
      , shipping_address: {
        recipient_name: state.recipient_name
        , line1:        state.line1
        , line2:        state.line2
        , city:         state.city
        , country_code: state.country_code
        , postal_code:  state.postal_code
        , phone:        state.phone
        , state:        state.state
      }
      , infomation: {
        first_name:     state.first_name
        , last_name:    state.last_name
      //  , gender:       state.gender
      //  , year:         state.year
      //  , month:        state.month
      //  , day:          state.day
        , email: state.email
      //  , confirm_email:  state.confirm_email
        , area:         state.area
        , delivery:     state.delivery
        , payment:      state.payment
        , message:      state.message
      //  , agreement:    state.agreement
      }
    });
  }

  setShippingAddress(value, isLangJp) {
    let newAddress = {};
    newAddress['japan'] = {
      country_code:     [ 'JP' ]
      , postal_code:    isLangJp ? '135-0046'     : '135-0046'
      , state:          isLangJp ? '東京都'       : 'TOKYO'
      , city:           isLangJp ? '江東区'       : 'Koto-ku,'
      , line1:          isLangJp ? '牡丹'
                                 : 'Botan,'
      , line2:          isLangJp ? '1-2-2, 東京オフィス'
                                 : 'Address 1-2-2, TOKYO OFFICE'
    };
    newAddress['myanmer'] = {
      country_code:     [ 'MM' ]
      , postal_code:    '11181'
      , state:          'YANGON'
      , city:           'Kamayut Tsp'
      , line1:          'Hledan Center'
      , line2:          '#307, 3rd Floor, MYANMER OFFICE'
    };
    return value === 'japan' || value === 'myanmer'
      ? newAddress[value]
      : {
        country_code:     []
        , state:          ''
        , postal_code:    ''
        , city:           ''
        , line1:          ''
        , line2:          ''
        , recipient_name: ''
      };
  }

  //setShippingCountry(value, shipping, isLangJp) {
  //  const ems =  shipping.ems.filter(obj => obj.code_2 === value);
  //  return { state: isLangJp ? ems[0].name_jp : ems[0].name_en };
  //}

  componentWillReceiveProps(nextProps) {
    //log.trace(nextProps);
    if(nextProps.results) {
      if(nextProps.results.accepted
      && nextProps.results.accepted[0] === this.state.email)
        this.setState({
          results: nextProps.results
          , showModalResults: true
        });
      else if(nextProps.results.error)
        this.setState({
          results: nextProps.results
          , showModalResults: true
        });
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

  //shouldComponentUpdate(nextProps, nextState) {
  //  return !this.isNotChanged(nextState, this.state);
  //}

  componentWillUpdate(props, state) {
    if(!this.isValid(state)) return;
    const price = this.isPrice(props.currency, state);
    const shipping =
      this.isShipping(props.shipping, props.currency, state);
    const subtotal = price * state.quantity.join();
    this.payment = {
      price:        price
      , shipping:   shipping
      , subtotal:   subtotal
      , total:      subtotal + shipping
      , total_currency: state.currency
      , name:       'Myanmar Companies YearBook Vol.1'
      , description:'Myanmar Companies Yearbook'
    };
    //this.logTrace(this.payment);
  }

  componentDidUpdate(prevProps, prevState) {
    this.componentWillUnmount();
    this.componentDidMount();

    const state = this.state;
    if(!this.isValid(state)) return;

    const payment = this.payment;
    const options = this.setOptions(state, payment);
    if(this.isPayPal(state)) {
      AppAction.createExpress(options);
      this.logTrace(payment);
    }
  }

  componentWillUnmount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    buttonNode.removeChild(this.el);
  }

  isLangJp() {
    return this.props.language === 'jp';
  }

  isCredit(state) {
    return !this.isMail(state) && !this.isUSD(state)
      && this.payment.shipping !== -1;
  }

  isPayPal(state) {
    return !this.isMail(state) && this.isUSD(state)
      && this.payment.shipping !== -1;
  }

  isPrice(currency, state) {
    return this.isAreaJp(state)
      ? this.isUSD(state)
        ? Math.ceil(state.jpy / currency.USDJPY)
        : Number(state.jpy)
      : this.isUSD(state)
        ? Number(state.usd)
        : Math.ceil(currency.USD);
  }

  isShipping(shipping, currency, state) {
    const isJpp = obj => shipping.jpp.filter(jpp =>
      jpp.name_jp === obj.state.toUpperCase()
        || jpp.name_en === obj.state.toUpperCase())[0];
    const isEms = obj => shipping.ems.filter(ems =>
      ems.code_2 === obj.country_code.join()
      && (ems.ems1 === 'OK' || ems.ems2_1 === 'OK' ||
        ems.ems2_2 === 'OK' || ems.ems3   === 'OK') )[0];
    const isPay = obj => shipping.ems.filter(ems =>
      ems.code_2 === obj.country_code.join() && ems.paypal === 'OK' )[0];
    return this.isAreaJp(state)
      ? state.delivery === 'japan'
        ? 0
        : isJpp(state)
          ? this.isUSD(state)
            ? Math.ceil(isJpp(state).price * state.quantity.join()
              / currency.USDJPY)
            : Number(isJpp(state).price) * state.quantity.join()
          : -1
      : state.delivery === 'myanmer'
        ? 0
        : isEms(state) && isPay(state) && this.isConfirm(shipping, state)
          ? this.isUSD(state)
            ? Math.ceil(isEms(state).price * state.quantity.join()
              / currency.USDJPY)
            : Number(isEms(state).price) * state.quantity.join()
          : -1;
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

  isAreaJp(state) {
    return state.country_code && state.country_code.join() === 'JP';
  }

  isUSD(state) {
    return state.currency && state.currency.join() === 'USD';
  }

  isMail(state) {
    return state.payment && state.payment.join() !== 'paypal';
  }

  isValid(state) {
    return (
      state.country_code      && (state.country_code.join() !== '')
      && state.state
      && state.city
      && state.quantity       && (state.quantity.join() !== '')
      && state.currency       && (state.currency.join() !== '')
      && state.payment        && (state.payment.join() !== '')
      && state.first_name
      && state.last_name
      && state.phone          && !this.isNotPhone(state.phone)
      && state.email          && !this.isNotEmail(state.email)
      //&& state.confirm_email  && (state.email === state.confirm_email)
      && state.postal_code
      && !this.isNotPostal(state.postal_code, state.country_code.join())
      && state.line1
      && state.line2
      && state.area
      && state.delivery
      //&& state.agreement
    );
  }
  
  /*
  isNotChanged(next, prev) {
    return (
      next.first_name       === prev.first_name  
      && next.last_name     === prev.last_name   
      //&& next.gender        === prev.gender
      //&& next.year          === prev.year
      //&& next.month         === prev.month
      //&& next.day           === prev.day
      && next.phone         === prev.phone       
      && next.email         === prev.email       
      //&& next.confirm_email === prev.confirm_email
      && next.area          === prev.area
      && next.delivery      === prev.delivery
      && next.country_code  === prev.country_code
      && next.state         === prev.state
      && next.city          === prev.city
      && next.postal_code   === prev.postal_code
      && next.line1         === prev.line1       
      && next.line2         === prev.line2      
      && next.recipient_name=== prev.recipient_nama
      && next.quantity      === prev.quantity
      && next.currency      === prev.currency
      && next.payment       === prev.payment
      && next.message       === prev.message
      //&& next.agreement     === prev.agreement   
      && next.usd           === prev.usd
      && next.jpy           === prev.jpy
      && next.showModalResults === prev.showModalResults
      && next.showModalCredit  === prev.showModalCredit
    );
  }
  */

  isNotEmail(val) {
    return !std.regexEmail(val);
  }

  //isNotNumber(val) {
  //  return !/^[\d,-]+$/.test(val);
  //}

  isNotPhone(val) {
    return !std.regexNumber(val);
  }

  isNotPostal(val, country_code) {
    return !std.regexZip(val, country_code);
  }

  //checkConfirmEmail(string, isLangJp) {
  //  return this.state.email !== string
  //      ? isLangJp
  //        ? 'メールアドレスを再入力してください。'
  //        : 'Type password again.'
  //      : '';
  //}

  checkEmail(value, isLangJp) {
    return this.isNotEmail(value)
      ? isLangJp
        ? '正しいメールアドレスを入力してください。'
        : 'Please enter the correct e-mail address.'
      : '';
  }
  
  //checkPostal(country_code, postal_code, isLangJp) {
  //  return isNotPostal(postal_code, country_code)
  //      ? isLangJp
  //        ? '正しい郵便番号を入力してください。'
  //        : 'Please enter the correct postal code.'
  //      : '';
  //}

  checkPhone(value, isLangJp) {
    return this.isNotPhone(value)
        ? isLangJp
          ? '半角数字を入力して下さい。'
          : 'Please enter a number.'
        : '';
  }

  //checkNumber(value1, value2, isLangJp) {
  //  return value2 != null
  //    ? ( this.isNotNumber(value1) || this.isNotNumber(value2) )
  //      ? isLangJp
  //        ? '半角数字を入力して下さい。' 
  //        : 'Please enter a number.'
  //      : ''
  //    : ( this.isNotNumber(value1) )
  //      ? isLangJp
  //        ? '半角数字を入力して下さい。'
  //        : 'Please enter a number.'
  //      : '';
  //}

  renderSelect(objs, key, value) {
    if(!objs) return null;
    const opts = objs.map(obj => ({ key: obj[key], val: obj[value] }))
    return opts.map((opt, idx) => (<option
      key={"choice-" + idx} value={opt.val} >{opt.key}</option>));
  }

  renderButton(state) {
    if ( this.isMail(state) || this.isCredit(state)
    || !this.isValid(state) || this.payment.shipping === -1) {
      return <input type="submit" value="SEND"
        className="button-primary"/>
    } else {
      return <div></div>;
    }
  }

  renderNotice(showModal, { head, body }) {
    return showModal
      ? <fieldset className="category-group">
        <legend>{head}</legend>
        <p>{body}</p>
        </fieldset>
      : <div></div>
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
   
  render() {
    this.logTrace(this.state);
    //this.logTrace(this.payment);
    const shipping = this.props.shipping;
    const language = this.props.language;
    const isJP = this.isLangJp();
    
    const Information = isJP ? 'お客様の情報' : 'Your Information';
    const Delivery = isJP ? 'お引き渡し場所' : 'Place of delivery';
    const Area = isJP ? '配送先' : 'Delivery address';
    const Quantity = isJP
      ? 'ご購入数と通貨' : 'Purchasing quantities and currency'; 
    const HowToBuy = isJP ? 'お支払い方法' : 'Payment method'; 
    const Message = isJP ? 'メッセージ' : 'Message';

    const name = isJP ? 'お名前' : 'Name';
    //const gender = isJP ? '性別' : 'Gender';
    //const birthday = isJP ? '誕生日' : 'Birthday';
    const phone = isJP ? '電話番号' : 'Phone';
    const email = isJP ? 'メールアドレス' : 'E-Mail';
    //const confirm_email =isJP ? 'メールアドレス 確認' : 'Confirm E-Mail';
    const area = isJP ? '配送先' : 'Delivery address';
    const delivery = isJP ? 'お届け先' : 'Delivery address';
    const country_code = isJP ? '国名' : 'Country';
    const postal_code = isJP ? '郵便番号' : 'Zip Code';
    const state = isJP ? '都道府県' : 'State';
    const city = isJP ? '市区町村名' : 'City';
    const line1 = isJP ? '地域' : 'Municipality';
    const line2 = isJP ? '番地・部屋番号' : 'A lot / Room Number';
    const recipient_name = isJP ? '受取人名義' : 'Recipient Name';
    const quantity = isJP ? 'ご購入数' : 'Quantity';
    const currency = isJP ? '通貨' : 'Currency';
    const payment = isJP ? 'お支払い方法' : 'Payment';
    const message = isJP ? 'ご連絡事項' : 'Message';
    const agreement = ' Agree to our terms of us and privacy policy. ';

    const first_name = isJP ? '名' : 'First';
    const last_name = isJP ? '姓' : 'Last';
    const gender_male = isJP ? '男性' : 'Male';
    const gender_female = isJP ? '女性' : 'Female';
    const year = isJP ? '年' : 'Year';
    const month = isJP ? '月' : 'Month';
    const day = isJP ? '日' : 'Day';
    const area_domestic = isJP ? '日本国内' : 'Domestic delivery';
    const area_oversea = isJP ? 'それ以外' : 'Oversea delivery';
    const delivery_address = isJP ? '指定場所' : 'Delivery Address';
    const delivery_japan = isJP ? '日本本社' : 'Japan office';
    const delivery_myanmer = isJP ? 'ミャンマー支社' : 'Myanmar office';
    const delivery_check = isJP ? '住所を確認する' : 'Check the address';

    const notes_delivery = isJP 
      ? '配送先で送料が異なります。送料はメールでお知らせします。'
      : 'Shipping fee differs depending on shipping destination.'
        + 'Shipping fee will be notified by E-mail.';
    const label_quantity = isJP
      ? '冊 x '
      : 'book(s) x '
    const label_currency = isJP
      ? '（税込／送料別）'
      : '(tax included / shipping fee is separately)';

    const notes_quantity = isJP
      ? '日本国外への配送はUS '
        + Number(this.state.usd).toLocaleString('en-US'
          , { style: 'currency', currency: 'USD' })
        + ' を当日レートで日本円に換算した金額のご請求となります。'
      : 'Shipping outside of Japan will be charged for US '
        + Number(this.state.usd).toLocaleString('en-US'
      , { style: 'currency', currency: 'USD' })
        + ' into Japanese yen at the current rate.';
    const notes_currency = isJP
      ? 'US $ での支払の場合、PayPalアカウントが必要です。'
      : 'For payment with US $, a PayPal account is required.';
    const notes_payment = isJP
      ? 'ミャンマー発行のクレジットカードはご使用になれません。'
      : 'Credit card issued by Myanmar can not be used.';
      //? 'クレジット決済の場合は PayPalアカウント が必要となります。'
      //: 'For credit card transactions, you need a PayPal account.';
    const notes_notice = this.setNotice(this.state, isJP);
    const notes_confirm = this.setConfirm(shipping, this.state, isJP);

    const opts_country = [
      {  name_en: 'Japan'    , name_jp: '日本'           , code_2: 'JP' }
      ,{ name_en: 'Myanmar'  , name_jp: 'ミャンマー'     , code_2: 'MM' }
      ,{ name_en: 'Tai'      , name_jp: 'タイ'           , code_2: 'TH' }
      ,{ name_en: 'China'    , name_jp: '中華人民共和国 (中国)'
                                                         , code_2: 'CN' }
      ,{ name_en: 'Singapore', name_jp: 'シンガポール'   , code_2: 'SG' }
      ,{ name_en: 'Malaysia' , name_jp: 'マレーシア'     , code_2: 'MY' }
      ,{ name_en: 'Taiwan'   , name_jp: '台湾'           , code_2: 'TW' }
      ,{ name_en: 'Hong Kong', name_jp: '香港'           , code_2: 'HK' }
      ,{ name_en: 'Vietnam'  , name_jp: 'ベトナム'       , code_2: 'VN' }
      ,{ name_en: 'Korea'    , name_jp: '大韓民国 (韓国)', code_2: 'KR' }
    ];
    const select_country = shipping.ems
      ? isJP
        ? this.renderSelect(opts_country
          .concat(std.sortObjUni(shipping.ems, 'name_jp'))
          , 'name_jp', 'code_2') 
        : this.renderSelect(opts_country
          .concat(std.sortObjStr(shipping.ems, 'name_en'))
          , 'name_en', 'code_2')
      : null;

    const opts_currency = [
      {   name_en: 'JP ' +
        Number(this.state.jpy).toLocaleString('ja-JP') + ' yen'
        , name_jp:
        Number(this.state.jpy).toLocaleString('ja-JP') + ' 円'
        , value: 'JPY' }
      , { name_en: 'US ' + 
        Number(this.state.usd).toLocaleString('en-US'
          , { style: 'currency', currency: 'USD' })
        , name_jp:
        Number(this.state.usd).toLocaleString('en-US'
          , { style: 'currency', currency: 'USD' })
        , value: 'USD' }
    ];
    const select_currency = isJP
      ? this.renderSelect(opts_currency, 'name_jp', 'value')
      : this.renderSelect(opts_currency, 'name_en', 'value')

    const opts_payment = [
      {   name_en: 'Credit card (Paypal)'
        , name_jp: 'クレジットカード（PayPal）', value: 'paypal'  }
      , { name_en: 'Bank transfer (prepayment)'
        , name_jp: '銀行振り込み（前払い）'    , value: 'deposit' }
      , { name_en: 'Other'
        , name_jp: 'その他'                    , value: 'other'   }
    ];
    const select_payment = isJP
      ? this.renderSelect(opts_payment, 'name_jp', 'value')
      : this.renderSelect(opts_payment, 'name_en', 'value')

    const select_area = this.state.area === 'domestic'
      ? 'non-area' : 'area';
    const select_delivery = this.state.delivery === 'address'
      ? 'delivery' : 'non-delivery';

    const check_email
      = this.checkEmail(this.state.email, isJP);
    //const check_confirm_email
    //  = this.checkConfirmEmail(this.state.confirm_email, isJP);
    const check_phone
      = this.checkPhone(this.state.phone, isJP);
    //const check_postal_code
    //  = this.checkPostal(this.state.country_code.join()
    //    , this.state.postal_code);
    //const check_birthday
    //  = this.checkNumber(this.state.year, this.state.day, isJP);

    const toggledButton = this.renderButton(this.state);
    const results = this.setResults(this.state.results, isJP);
    const showModalCredit = !!this.state.showModalCredit;
    const showModalResults = !!this.state.showModalResults;
    const options = this.setOptions(this.state, this.payment);

    return <div className="buynow_contactlast">
      <form id="user-sign-up" onSubmit={this.handleSubmit.bind(this)}>
      {/* Your Informatin */}
      <fieldset className="category-group">
        <legend>{Information}</legend>
        <table><tbody>
        <tr>
        {/*
          <th>
          <label>
          {name} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <div className="multi-name-field">
        {/*
          <label htmlFor="first-name">{first_name}</label>
        */}
          <input type="text" name="first-name" id="first-name"
            onChange={this.handleChangeText.bind(this, 'first_name')}
            placeholder={first_name}
            className="name-field last-name add-placeholder required"/>
        {/*
          <label htmlFor="last-name">{last_name}</label>
        */}
          <input type="text" name="last-name" id="last-name"
            onChange={this.handleChangeText.bind(this, 'last_name')}
            placeholder={last_name}
            className="name-field add-placeholder required"/>
          </div>
          </td>
        </tr>
      {/*
        <tr>
          <th>
          <label>{gender}</label>
          </th>
          <td>
          <div className="gender-field">
          <Radio name="gender"
            value={this.state.gender}
            onChange={this.handleChangeRadio.bind(this, 'gender')} >
            <option value="male" id="gender-male"> {gender_male} </option>
            <option value="female" id="gender-female"> {gender_female} </option>
          </Radio>
          </div>
          </td>
        </tr>
        <tr>
          <th>
          <label>{birthday}</label>
          </th>
          <td>
          <label htmlFor="year">{year} </label>
          <span className="birthday-field">
          <input type="text" name="year" id="year" 
            onChange={this.handleChangeText.bind(this, 'year')}
            className="short-field add-placeholder"
            placeholder="1970"/>
          </span>
          <label htmlFor="month">{month} </label>
          <span className="birthday-field">
          <select name="month" id="month" className="short-field"
            multiple={false}
            value={this.state.month}
            onChange={this.handleChangeSelect.bind(this, 'month')}>
          <option value="">{month}</option>
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
          <option value="11">11</option>
          <option value="12">12</option>
          </select>
          </span>
          <label htmlFor="day">{day} </label>
          <span className="birthday-field">
          <input type="text" name="day" id="day"
            onChange={this.handleChangeText.bind(this, 'day')}
            className="short-field add-placeholder"
            placeholder="1"/>
          </span>
          <span className="notes">{check_birthday}</span>
          </td>
        </tr>
        */}
        <tr>
        {/*
          <th>
          <label htmlFor="phone">
          {phone} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="phone" id="phone"
            onChange={this.handleChangeText.bind(this, 'phone')}
            placeholder={phone}
            className=" add-placeholder required"/>
          <span className="notes">{check_phone}</span>
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="email">
          {email} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="email" id="email"
            onChange={this.handleChangeText.bind(this, 'email')}
            className="add-placeholder required"
            placeholder={email}/>
          <span className="notes">{check_email}</span>
          </td>
        </tr>
      {/*
        <tr>
          <th>
          <label htmlFor="confirm_email">
          {confirm_email} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="confirm_email" id="confirm_email"
            onChange={this.handleChangeText.bind(this, 'confirm_email')}
            className="required"/>
          <span className="notes">{check_confirm_email}</span>
          </td>
        </tr>
      */}
        </tbody></table>
      </fieldset>
      {/* Your Informatin */}

      {/* Your Delivery Address */}
      <fieldset className="category-group">
        <legend>{Area}</legend>
        <table><tbody>
        <tr>
        <th>
        {/*
          <label htmlFor="area">
          {area} <span className="required-mark">required</span>
          </label>
        */}
        </th>
        <td>
        <div className="area-field">
        <Radio name="area"
            value={this.state.area}
            onChange={this.handleChangeRadio.bind(this, 'area')} >
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

      {/* How to Buy */}
      <div className={select_area}>
      <fieldset className="category-group">
        <legend>{HowToBuy}</legend>
        <table><tbody>
        <tr>
        {/*
          <th>
          <label htmlFor="payment">
          {payment} <span className="required-mark">required</span>
          </label>
          </th>
        */}
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
          <span className="notes">{notes_payment}</span>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      </div>
      {/* How to buy */}

      {/* Quantity & Currency */}
      <fieldset className="category-group">
        <legend>{Quantity}</legend>
        <table><tbody>
        <tr>
        {/*
          <th>
          <label htmlFor="quantity">
          {quantity} <span className="required-mark">required</span>
          </label>
          </th>
        */}
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
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="13">13</option>
          <option value="14">14</option>
          <option value="15">15</option>
          <option value="16">16</option>
          <option value="17">17</option>
          <option value="18">18</option>
          <option value="19">19</option>
          <option value="20">20</option>
          </select>
          </span>
          <label>{label_quantity}</label>
          <span className="quantity-field">
          <select name="currency" id="currency"
            multiple={false}
            value={this.state.currency}
            onChange={this.handleChangeSelect.bind(this, 'currency')}
            className="short-field required">
          <option value="">{currency}</option>
          {select_currency}
          </select>
          </span>
          <label>{label_currency}</label>
          </div>
          <span className="notes">{notes_quantity}</span>
          <span className="notes">{notes_currency}</span>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Quantity & Currency */}

      {/* Delivery */}
      <fieldset className="category-group">
        <legend>{Delivery}</legend>
        <table><tbody>
        <tr>
        <th>
        {/*
          <label htmlFor="delivery">
          {delivery} <span className="required-mark">required</span>
          </label>
        */}
        </th>
        <td>
        <div className="delivery-field">
        <Radio name="delivery"
            value={this.state.delivery}
            onChange={this.handleChangeRadio.bind(this, 'delivery')} >
            <option value="address"
              id="delivery_address"> {delivery_address} </option>
            <option value="japan"
              id="delivery_japan"> {delivery_japan} </option>
            <option value="myanmer"
              id="delivery_myanmer"> {delivery_myanmer} </option>
        </Radio>
        <a className="btn btn-default" href="#"
            data-featherlight="#fl1">{delivery_check}</a>
        </div>
        <span className="notes">{notes_delivery}</span>
        </td>
        </tr>
        </tbody></table>
      <div className={select_delivery}>
        <table><tbody>
        <tr>
        {/*
          <th>
          <label htmlFor="country_code">
          {country_code} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <select name="country_code" id="country_code"
            multiple={false}
            value={this.state.country_code}
            onChange={this.handleChangeSelect.bind(this, 'country_code')}
            className="required">
          <option value="">{country_code}</option>
          {select_country}
          </select>
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="postal_code">
          {postal_code} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="postal_code" id="postal_code"
            value={this.state.postal_code}
            onChange={this.handleChangeText.bind(this, 'postal_code')}
            onFocus={this.handleFocusText.bind(this, 'postal_code')}
            className=" add-placeholder required"
            placeholder={postal_code} />
        {/*
          <span className="notes">{check_postal_code}</span>
        */}
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="state">
          {state} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="state" id="state"
            value={this.state.state}
            onChange={this.handleChangeText.bind(this, 'state')}
            onFocus={this.handleFocusText.bind(this, 'state')}
            placeholder={state}
            className="required add-placeholder" />
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="city">
          {city} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="city" id="city"
            value={this.state.city}
            onChange={this.handleChangeText.bind(this, 'city')}
            onFocus={this.handleFocusText.bind(this, 'city')}
            placeholder={city}
            className="required add-placeholder" />
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="line1">
          {line1} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="line1" id="line1"
            value={this.state.line1}
            onChange={this.handleChangeText.bind(this, 'line1')}
            onFocus={this.handleFocusText.bind(this, 'line1')}
            placeholder={line1}
            className="required add-placeholder" />
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="line2">
          {line2} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="line2" id="line2"
            value={this.state.line2}
            onChange={this.handleChangeText.bind(this, 'line2')}
            onFocus={this.handleFocusText.bind(this, 'line2')}
            placeholder={line2}
            className="required add-placeholder" />
          </td>
        </tr>
        <tr>
        {/*
          <th>
          <label htmlFor="recipient_name">{recipient_name}</label>
          </th>
        */}
          <td>
          <input type="text" name="recipient_name" id="recipient_name"
            value={this.state.recipient_name}
            onChange={this.handleChangeText.bind(this, 'recipient_name')}
            onFocus={this.handleFocusText.bind(this, 'recipient_name')}
            placeholder={recipient_name}
            className="add-placeholder"/>
          </td>
        </tr>
        </tbody></table>
      </div>
      </fieldset>
      {/* Delivery */}

      {/* Message */}
      <fieldset className="category-group">
        <legend>{Message}</legend>
        <table><tbody>
        <tr>
        {/*
          <th>
          <label htmlFor="message">
          {message}
          </label>
          </th>
        */}
          <td>
          <textarea name="message" id="message"
            cons="40" rows="10"
            onChange={this.handleChangeText.bind(this, 'message')}
            placeholder={message}
            className="add-placeholder"/>
          <span className="notes">{notes_notice}</span>
          <span className="notes">{notes_confirm}</span>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Message */}

      {/* Agreement }
      <div id="signup-agreement">
        <label>
        <span className="required-mark">required</span>
        {agreement}
        <input type="checkbox" name="agreement" id="agreement"
          onChange={this.handleChangeCheckbox.bind(this, 'agreement')}
          className="required"/>
        </label>
      </div>
      { Agreement */}

      {this.renderNotice(showModalResults, results)}

      {/* Confirm */}
      <div id="signup-next">
        {toggledButton}
        <div ref="signup_next"></div>
      </div>
    </form>
    {/*
    <Modal showModal={showModalResults}>
      <Notice message={results}
        onCompleted={this.handleClickButton.bind(this, 'results')}/>
    </Modal>
    */}
    <Modal showModal={showModalCredit}>
      <Credit language={language} options={options}
        onReturn={this.handleClickClose.bind(this, 'credit')}
        onCompleted={this.handleClickButton.bind(this, 'credit')}/>
    </Modal>
    </div>;
  }
};
export default AppBody;

import React from 'react';
import ReactDOM from 'react-dom'
import Radio from 'Components/Radio/Radio';
import AppAction from 'Actions/AppAction';
import std from 'Utilities/stdutils';
import { log } from 'Utilities/webutils';

const pspid = 'AppBodyView';

class AppBody extends React.Component {
  constructor(props) {
    super(props);
    const usd = props.usd;
    const jpy = props.jpy;
    const options = props.options;
    const results = props.results;

    const infomation =        options.infomation;
    const details =           options.details;
    const item =              options.item;
    const shipping_address =  options.shipping_address;

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
      currency:       item.currency
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
      , delivery:       infomation.delivery
      , payment:        infomation.payment
    //  , agreement:      infomation.agreement
      , message:        infomation.message
      , usd:            usd
      , jpy:            jpy
      , results:        results
    };
  }

  handleChangeText(name, e) {
    let newState = {};
    newState[name] = e.target.value;
    this.setState(newState);
  }

  handleChangeCheckbox(name, e) {
    let newState = {};
    newState[name] = e.target.checked;
    this.setState(newState);
  }

  handleChangeRadio(name, e) {
    let newState = {};
    newState[name] = e.target.value;
    const newAddress = this.setAddress(e.target.value);
    this.setState(Object.assign({}, newState, newAddress));
  }

  handleChangeSelect(name, e) {
    let newState = {};
    let options = e.target.options;
    let values = [];
    for( let i=0; i<options.length; i++) {
      if(options[i].selected) values.push(options[i].value);
    }
    newState[name] = values;
    this.setState(newState);
  }

  handleSubmit(e) {
    e.preventDefault();
    if(!this.isValid(this.state)) return;

    const options = this.setOptions(this.state, this.payment);
    if(this.isCredit(this.state)) {
      AppAction.createCredit(options);
    } else {
      AppAction.createMessage(options);
    }
    this.logTrace(this.payment);
    //this.logTrace(this.state);
  }

  setOptions(state, pay) {
    return {
      total: pay.total
      , currency: pay.total_currency
      , details: {
        subtotal: pay.subtotal
        , shipping: pay.shipping
      }
      , item: {
        name: pay.name
        , description: pay.description
        , quantity: state.quantity
        , price: pay.price
        , currency: state.currency
      }
      , shipping_address: {
        recipient_name: state.recipient_name
        , line1: state.line1
        , line2: state.line2
        , city: state.city
        , country_code: state.country_code
        , postal_code: state.postal_code
        , phone: state.phone
        , state: state.state
      }
      , infomation: {
        first_name: state.first_name
        , last_name: state.last_name
      //  , gender: state.gender
      //  , year: state.year
      //  , month: state.month
      //  , day: state.day
        , email: state.email
      //  , confirm_email: state.confirm_email
        , delivery: state.delivery
        , payment: state.payment
        , message: state.message
      //  , agreement: state.agreement
      }
    }
  }

  setAddress(value) {
    let newAddress = {};
    newAddress['japan'] = {
      country_code:     [ 'JP' ]
      , state:          '日本'
      , postal_code:    '135-0046'
      , city:           '東京都'
      , line1:          '江東区'
      , line2:          '牡丹1-2-2'
      , recipient_name: '東京オフィス'
    };
    newAddress['myanmer'] = {
      country_code:     [ 'MM' ]
      , state:          'Myanmer'
      , postal_code:    '11181'
      , city:           'YANGON'
      , line1:          'Hledan Center, Kamayut Tsp'
      , line2:          '#307, 3rd Floor'
      , recipient_name: 'MYANMER OFFICE'
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

  componentWillReceiveProps(nextProps) {
    if(nextProps.results) {
      if(nextProps.results.accepted
      && nextProps.results.accepted[0] === this.state.email)
        this.setState({ results: nextProps.results });
      else if(nextProps.results.error)
        this.setState({ results: nextProps.results });
    }

    if(nextProps.jpy || nextProps.usd) 
      //log.trace(nextProps);
      this.setState({ usd: nextProps.usd, jpy: nextProps.jpy });
  }

  componentDidMount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    const el = this.el = document.createElement('div');
    el.setAttribute('id','paypal-button');
    buttonNode.appendChild(el);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.isNotChanged(nextState, this.state);
  }

  componentWillUpdate(props, state) {
    if(!this.isValid(state)) return;
    const price = this.isPrice(props.currency, state);
    const shipping =
      this.isShipping(props.shipping, props.currency, state);
    const subtotal = price * state.quantity.join();
    const total = subtotal + shipping;
    const total_currency = state.currency;
    const name = 'Myanmar Companies YearBook Vol.1';
    const description = 'Myanmar Companies Yearbook';
    this.payment = { price, shipping, subtotal, total, total_currency
      , name, description };
    this.logTrace(this.payment);
  }

  componentDidUpdate(prevProps, prevState) {
    this.componentWillUnmount();
    this.componentDidMount();

    if(!this.isValid(this.state)) return;

    const options = this.setOptions(this.state, this.payment);
    if(this.isPayPal(state)) {
      AppAction.createPayment(options);
    }
    this.logTrace(this.payment);
  }

  componentWillUnmount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    buttonNode.removeChild(this.el);
  }

  isCredit(state) {
    return !this.isMail(state) && !this.isUSD(state)
      && this.payment.shipping;
  }

  isPayPal(state) {
    return !this.isMail(state) && this.isUSD(state)
      && this.payment.shipping;
  }

  isPrice(currency, state) {
    return this.isJP(state)
      ? Number(state.jpy)
      : this.isUSD(state)
        ? Math.ceil(state.usd)
        : Math.ceil(currency.USD);
  }

  isShipping(shipping, currency, state) {
    const isJpp = obj => shipping.jpp.filter(jpp =>
      jpp.city === obj.city)[0];
    const isEms = obj => shipping.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0];
    const isPay = obj => shipping.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0].paypal === 'OK';
    return this.isJP(state)
      ? isJpp(state)
        ? Number(isJpp(state).price)
        : 0 
      : isEms(state) && isPay(state)
        ? this.isUSD(state)
          ? Math.ceil((isEms(state).price) / currency.USDJPY)
          : Math.ceil(isEms(state).price)
        : 0;
  }

  isJP(state) {
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
      && state.phone          && !this.isNotNumber(state.phone)
      && state.email          && !this.isNotEmail(state.email)
      //&& state.confirm_email  && (state.email === state.confirm_email)
      && state.postal_code    && !this.isNotNumber(state.postal_code)
      && state.line1
      && state.line2
      && state.delivery
      //&& state.agreement
    );
  }
  
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
      && next.jpy           === prev.jpy
      && next.usd           === prev.usd
    );
  }

  isNotEmail(val) {
    return !/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(val);
  }

  isNotNumber(val) {
    return !/^[\d,-]+$/.test(val);
  }

  checkConfirmEmail(string, isJP) {
    return this.state.email !== string
        ? isJP
          ? 'メールアドレスを再入力してください。'
          : 'Type password again.'
        : '';
  }

  checkEmail(value, isJP) {
    return this.isNotEmail(value)
      ? isJP
        ? '正しいメールアドレスを入力してください。'
        : 'Please enter the correct e-mail address.'
      : '';
  }
  
  checkNumber(value1, value2, isJP) {
    return value2 != null
      ? ( this.isNotNumber(value1) || this.isNotNumber(value2) )
        ? isJP
          ? '半角数字を入力して下さい。' 
          : 'Please enter a number.'
        : ''
      : ( this.isNotNumber(value1) )
        ? isJP
          ? '半角数字を入力して下さい。'
          : 'Please enter a number.'
        : '';
  }

  renderSelect(objs, key, value) {
    if(!objs) return null;
    const opts = objs.map(obj => ({ key: obj[key], val: obj[value] }))
    return opts.map((opt, idx) => (<option
      key={"choice-" + idx} value={opt.val} >{opt.key}</option>));
  }

  renderButton(state, isJP) {
    if ( this.isMail(state) || this.isCredit(state)
    || !this.isValid(state) || !this.payment.shipping) {
      return isJP 
        ? <input type="submit" value="SEND" className="button-primary"/>
        : <input type="submit" value="SEND" className="button-primary"/>
    } else {
      return <div></div>;
    }
  }

  renderModal(results, isJP) {
    let head = '';
    let body = '';
    if (results.accepted) {
      head = isJP
        ? 'ご利用ありがとうございました！'
        : 'Thank you for using!';
      body = isJP
        ? 'ご依頼の商品の詳細は別途メールにてご連絡させて頂きます。'
        : 'Details of the requested item will be notified separately by e-mail.';
    } else if (results.error) {
      head = results.error.name;
      body = isJP ? results.error.message.jp : results.error.message.en;
    } 
    return (<div className="modalDialog">
        <div>
        <h3>{head}</h3>
        <p>{body}</p>
        </div>
      </div>);
  }

  logInfo(message) {
    log.info(`${pspid}>`, 'Request:', message);
  }
   
  logTrace(message) {
    log.trace(`${pspid}>`, 'Response:', message);
  }
   
  logError(error) {
    log.error(`${pspid}>`, error.name, error.message);
  }
   
  render() {
    //this.logTrace(this.state);
    const shipping = this.props.shipping;
    const language = this.props.language;

    const isJP = language === 'jp' ? true : false;
    
    const Information = isJP ? 'お客様の情報' : 'Your Information';
    const Delivery = isJP ? 'お引き渡し場所' : 'Place of delivery';
    const Shipping = isJP ? 'お届け先' : 'Delivery address';
    const Quantity = isJP
      ? 'ご購入数と通貨' : 'Purchasing quantities and currency'; 
    const HowToBuy = isJP ? 'お支払い方法' : 'Payment method'; 
    const Message = isJP ? 'メッセージ' : 'Message';

    const name = isJP ? 'お名前' : 'Name';
    const gender = isJP ? '性別' : 'Gender';
    const birthday = isJP ? '誕生日' : 'Birthday';
    const phone = isJP ? '電話番号' : 'Phone';
    const email = isJP ? 'メールアドレス' : 'E-Mail';
    const confirm_email = isJP ? 'メールアドレス 確認' : 'Confirm E-Mail';
    const delivery = isJP ? 'お届け先' : 'Delivery address';
    const country_code = isJP ? '国名' : 'Country';
    const state = isJP ? '州名' : 'State';
    const postal_code = isJP ? '郵便番号' : 'Zip Code';
    const city = isJP ? '都市名' : 'City';
    const line1 = isJP ? '市区町村名' : 'Municipality';
    const line2 = isJP ? '地番・部屋番号' : 'A lot / Room Number';
    const recipient_name = isJP ? '受取人名義' : 'Recipient Name';
    const quantity = isJP ? 'ご購入数' : 'Quantity';
    const currency = isJP ? '通貨' : 'Currency';
    const payment = isJP ? 'お支払い方法' : 'Payment';
    const message = isJP ? 'ご連絡事項' : 'Message';
    const agreement = ' Agree to our terms of us and privacy policy. ';

    const first_name = isJP ? '名字' : 'First';
    const last_name = isJP ? '名前' : 'Last';
    const gender_male = isJP ? '男性' : 'Male';
    const gender_female = isJP ? '女性' : 'Female';
    const year = isJP ? '年' : 'Year';
    const month = isJP ? '月' : 'Month';
    const day = isJP ? '日' : 'Day';
    const delivery_address = isJP? '指定場所' : 'Delivery Address';
    const delivery_japan = isJP ? '日本本社' : 'Japan office';
    const delivery_myanmer = isJP ? 'ミャンマー支社' : 'Myanmar office';
    const delivery_check = isJP ? '住所を確認する' : 'Check the address';

    const notes_delivery = isJP 
      ? '配送先で送料が異なります。送料はメールでお知らせします。'
      : 'Shipping fee differs depending on shipping destination. Shipping fee will be notified by E-mail.';
    const label_quantity = isJP
      ? '冊 x '
      : 'book(s) x '
    const label_currency = isJP
      ? '（税込／送料別）'
      : '(tax included / shipping fee is separately)';

    const notes_quantity = isJP
      ? '日本国外への配送はUS '
        + Number(this.state.usd)
          .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        + ' を当日レートで日本円に換算した金額のご請求となります。'
      : 'Shipping outside of Japan will be charged for US '
        + Number(this.state.usd)
          .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        + ' into Japanese yen at the current rate.';
    const notes_currency = isJP
      ? 'US $ での支払の場合、PayPalアカウントが必要です。'
      : 'For payment with US $, a PayPal account is required.';
    const notes_payment = isJP
      ? 'ミャンマー発行のクレジットカードはご使用になれません。'
      : 'Credit card issued by Myanmar can not be used.';
      //? 'クレジット決済の場合は PayPalアカウント が必要となります。'
      //: 'For credit card transactions, you need a PayPal account.';

    const opts_country = [
      {   name_en: 'Japan'    , name_jp: '日本'           , code_2: 'JP' }
      , { name_en: 'Myanmar'  , name_jp: 'ミャンマー'     , code_2: 'MM' }
      , { name_en: 'Tai'      , name_jp: 'タイ'           , code_2: 'TH' }
      , { name_en: 'China'    , name_jp: '中華人民共和国 (中国)'
                                                          , code_2: 'CN' }
      , { name_en: 'Singapore', name_jp: 'シンガポール'   , code_2: 'SG' }
      , { name_en: 'Malaysia' , name_jp: 'マレーシア'     , code_2: 'MY' }
      , { name_en: 'Taiwan'   , name_jp: '台湾'           , code_2: 'TW' }
      , { name_en: 'Hong Kong', name_jp: '香港'           , code_2: 'HK' }
      , { name_en: 'Vietnam'  , name_jp: 'ベトナム'       , code_2: 'VN' }
      , { name_en: 'Korea'    , name_jp: '大韓民国 (韓国)', code_2: 'KR' }
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
          Number(this.state.usd)
          .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        , name_jp:
          Number(this.state.usd)
          .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
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

    const select_delivery = this.state.delivery === 'address'
      ? 'delivery' : 'non-delivery';

    const check_email
      = this.checkEmail(this.state.email, isJP);
    //const check_confirm_email
    //  = this.checkConfirmEmail(this.state.confirm_email, isJP);
    const check_phone
      = this.checkNumber(this.state.phone, null, isJP);
    //const check_postal_code
    //  = this.checkNumber(this.state.postal_code, null, isJP);
    //const check_birthday
    //  = this.checkNumber(this.state.year, this.state.day, isJP);

    const toggledButton = this.renderButton(this.state, isJP);
    const popupModal = this.state.results
      ? this.renderModal(this.state.results, isJP) : <div></div>;

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

      {/* How to Buy */}
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
      {/* How to buy */}

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
      </fieldset>
      {/* Delivery */}

      {/* Your Shipping Address */}
      <div className={select_delivery}>
      <fieldset className="category-group">
        <legend>{Shipping}</legend>
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
          <label htmlFor="state">
          {state} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="state" id="state"
            onChange={this.handleChangeText.bind(this, 'state')}
            placeholder={state}
            className="required add-placeholder" />
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
            onChange={this.handleChangeText.bind(this, 'postal_code')}
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
          <label htmlFor="city">
          {city} <span className="required-mark">required</span>
          </label>
          </th>
        */}
          <td>
          <input type="text" name="city" id="city"
            onChange={this.handleChangeText.bind(this, 'city')}
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
            onChange={this.handleChangeText.bind(this, 'line1')}
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
            onChange={this.handleChangeText.bind(this, 'line2')}
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
            onChange={this.handleChangeText.bind(this, 'recipient_name')}
            placeholder={recipient_name}
            className="add-placeholder"/>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      </div>
      {/* Your Shipping Address */}

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

      {/* Confirm */}
      <div id="signup-next">
        {toggledButton}
        <div ref="signup_next"></div>
      </div>
      </form>
      {popupModal}
    </div>;
  }
};
export default AppBody;

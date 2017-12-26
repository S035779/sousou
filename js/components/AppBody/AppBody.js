import React from 'react';
import ReactDOM from 'react-dom'
import Radio from '../../components/Radio/Radio';
import AppAction from '../../actions/AppAction';
import { log } from '../../utils/webutils';

const pspid = 'AppBodyView';

class AppBody extends React.Component {
  constructor(props) {
    super(props);
    const usd = props.usd;
    const jpy = props.jpy;
    const options = props.options;
    const message = props.message;

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
      , currency:       item.currency
    };

    this.state = {
      quantity:         item.quantity
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
      , gender:         infomation.gender
      , year:           infomation.year
      , month:          infomation.month
      , day:            infomation.day
      , email:          infomation.email
      , confirm_email:  infomation.confirm_email
      , payment:        infomation.payment
      , agreement:      infomation.agreement
      , usd:            usd
      , jpy:            jpy
      , message:        message
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
    this.setState(newState);
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
    AppAction.createMessage(options);
    //this.logTrace(this.state);
    //this.logTrace(this.payment);
  }

  setOptions(state, pay) {
    return {
      total: pay.total
      , currency: pay.currency
      , details: {
        subtotal: pay.subtotal
        , shipping: pay.shipping
      }
      , item: {
        name: pay.name
        , description: pay.description
        , quantity: state.quantity ? state.quantity.join() : ''
        , price: pay.price
        , currency: pay.currency
      }
      , shipping_address: {
        recipient_name: state.recipient_name
        , line1: state.line1
        , line2: state.line2
        , city: state.city
        , country_code: state.country_code
          ? state.country_code.join() : ''
        , postal_code: state.postal_code
        , phone: state.phone
        , state: state.state
      }
      , infomation: {
        first_name: state.first_name
        , last_name: state.last_name
        , gender: state.gender
        , year: state.year
        , month: state.month ? state.month.join() : ''
        , day: state.day
        , email: state.email
        , confirm_email: state.confirm_email
        , payment: state.payment ? state.payment.join() : ''
        , agreement: state.agreement
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.message && nextProps.message.accepted
      && nextProps.message.accepted[0] === this.state.email)
      this.setState({ message: nextProps.message });
    if(nextProps.jpy || nextProps.usd) 
      console.log(nextProps);
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

  componentWillUpdate(nextProps, nextState) {
    if(!this.isValid(nextState)) return;

    const state = nextState;
    const props = nextProps;
    const curr = props.currency;
    const ship = props.shipping;
    const isJP = obj => obj.country_code.join() === 'JP';
    const isCty = obj => ship.jpp.filter(jpp =>
      jpp.city === obj.city)[0];
    const isEms = obj => ship.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0];
    const isPay = obj => ship.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0].paypal === 'OK';
    const price = isJP(state) ? Number(curr.JPY) : Math.ceil(curr.USD);
    const shipping = isJP(state)
      ? (isCty(state) ? Number(isCty(state).price) : 0) 
      : (isEms(state) && isPay(state) ? Number(isEms(state).price) : 0);
    const subtotal = price * state.quantity;
    const total = subtotal + shipping;
    const total_currency = 'JPY';
    const name = 'Myanmar Companies YearBook Vol.1';
    const description = 'Myanmar Companies Yearbook';
    const currency = 'JPY';

    this.payment = { price, shipping, subtotal, total, total_currency
      , name, description, currency };
    this.logTrace(this.payment);
  }

  componentDidUpdate(prevProps, prevState) {
    this.componentWillUnmount();
    this.componentDidMount();

    if(!this.isValid(this.state)
      || this.isMail(this.state) || !this.payment.shipping) return;
    const options = this.setOptions(this.state, this.payment);
    AppAction.createPayment(options);
    //this.logTrace(this.state);
    //this.logTrace(this.payment);
  }

  componentWillUnmount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    buttonNode.removeChild(this.el);
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
      && state.payment        && (state.payment.join() !== '')
      && state.first_name
      && state.last_name
      && state.phone          && !this.isNotNumber(state.phone)
      && state.email          && !this.isNotEmail(state.email)
      && state.confirm_email  && (state.email === state.confirm_email)
      && state.postal_code    && !this.isNotNumber(state.postal_code)
      && state.line1
      && state.line2
      && state.agreement
    );
  }
  
  isNotChanged(next, prev) {
    return (
      next.country_code     === prev.country_code
      && next.gender        === prev.gender
      && next.year          === prev.year
      && next.month         === prev.month
      && next.day           === prev.day
      && next.city          === prev.city
      && next.quantity      === prev.country_code
      && next.payment       === prev.payment
      && next.first_name    === prev.first_name  
      && next.last_name     === prev.last_name   
      && next.phone         === prev.phone       
      && next.email         === prev.email       
      && next.confirm_email === prev.confirm_email
      && next.postal_code   === prev.postal_code
      && next.line1         === prev.line1       
      && next.line2         === prev.line2      
      && next.recipient_name=== prev.recipient_nama
      && next.agreement     === prev.agreement   
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

  renderSelect(objs, key, value, isJP) {
    if(!objs) return null;
    const opts_jp = [
      { key: '', val: '' },
      { key: '日本', val: 'JP' },
      { key: 'ミャンマー', val: 'MM' },
      { key: 'タイ', val: 'TH' },
      { key: '中華人民共和国 (中国)', val: 'CN' },
      { key: 'シンガポール', val: 'SG' },
      { key: 'マレーシア', val: 'MY' },
      { key: '台湾', val: 'TW' },
      { key: '香港', val: 'HK' },
      { key: 'ベトナム', val: 'VN' },
      { key: '大韓民国 (韓国)', val: 'KR' },
    ];
    const opts_en = [
      { key: '', val: '' },
      { key: 'Japan', val: 'JP' },
      { key: 'Myanmar', val: 'MM' },
      { key: 'Tai', val: 'TH' },
      { key: 'China', val: 'CN' },
      { key: 'Singapore', val: 'SG' },
      { key: 'Malaysia', val: 'MY' },
      { key: 'Taiwan', val: 'TW' },
      { key: 'Hong Kong', val: 'HK' },
      { key: 'Vietnam', val: 'VN' },
      { key: 'Korea', val: 'KR' },
    ];
    const tmps = objs.map(obj => ({ key: obj[key], val: obj[value] }))
    const opts = (isJP ? opts_jp : opts_en).concat(tmps);
    return opts.map((opt, idx) => (<option
      key={"choice-" + idx} value={opt.val} >{opt.key}</option>));
  }

  renderButton(state, isJP) {
    return (this.isMail(state) || !this.isValid(state)
      || !this.payment.shipping)
      ? isJP 
        ? <input type="submit" value="ご購入" className="button-primary"/>
        : <input type="submit" value="Purchase" className="button-primary"/>
      : <div></div>;
  }

  renderModal(state, isJP) {
    return state.message
      ? isJP
        ? <div className="modalDialog">
          <div>
            <h3>ご利用ありがとうございました！</h3>
            <p>ご依頼の商品の詳細は別途メールにてご連絡させて頂きます。</p>
          </div>
          </div>
        : <div className="modalDialog">
          <div>
            <h3>Thank you for using!</h3>
            <p>Details of the requested item will be notified separately
              by e-mail.</p>
          </div>
          </div>
      : <div></div>;
   }

  render() {
    //this.logTrace(state);
    const shipping = this.props.shipping;
    const language = this.props.language;

    const isJP = language === 'jp' ? true : false;
    const name = isJP ? 'お名前' : 'Name';
    const gender = isJP ? '性別' : 'Gender';
    const birthday = isJP ? '誕生日' : 'Birthday';
    const phone = isJP ? '電話番号' : 'Phone';
    const email = isJP ? 'メールアドレス' : 'E-Mail';
    const confirm_email = isJP ? 'メールアドレス 確認' : 'Confirm E-Mail';
    const country_code = isJP ? '国名' : 'Country';
    const state = isJP ? '州名' : 'State';
    const postal_code = isJP ? '郵便番号' : 'Zip Code';
    const city = isJP ? '都市名' : 'City';
    const line1 = isJP ? '市区町村名' : 'Municipality';
    const line2 = isJP ? '地番・部屋番号' : 'A lot / Room Number';
    const recipient_name = isJP ? '受取人名義' : 'Recipient Name';
    const quantity = isJP ? 'ご購入数' : 'Quantity';
    const payment = isJP ? 'お支払い方法' : 'Payment';

    const first_name = isJP ? '名字' : 'First';
    const last_name = isJP ? '名前' : 'Last';
    const gender_male = isJP ? '男性' : 'Male';
    const gender_female = isJP ? '女性' : 'Female';
    const year = isJP ? '年' : 'Year';
    const month = isJP ? '月' : 'Month';
    const day = isJP ? '日' : 'Day';

    const usd = Number(this.state.usd).toLocaleString();
    const jpy = Number(this.state.jpy).toLocaleString();
    const label_quantity = isJP
      ? '冊 x ' + jpy + '円（税込／送料別）'
      : 'book(s) x ' + jpy
        + ' yen (tax included / shipping fee is separately)';
    const notes_quantity = isJP
      ? '日本国外への配送はUS $ ' + usd
        + 'を当日レートで日本円に換算した金額のご請求となります。'
      : 'Shipping outside of Japan will be charged for US $ ' + usd
        + 'into Japanese yen at the current rate.';
    const notes_payment = isJP
      ? 'クレジット決済の場合は PayPalアカウント が必要となります。'
      : 'For credit card transactions, you need a PayPal account.';

    const country = isJP
      ? this.renderSelect(shipping.ems, 'name_jp', 'code_2', isJP) 
      : this.renderSelect(shipping.ems, 'name_en', 'code_2', isJP);

    const check_email
      = this.checkEmail(this.state.email, isJP);
    const check_confirm_email
      = this.checkConfirmEmail(this.state.confirm_email, isJP);
    const check_phone
      = this.checkNumber(this.state.phone, null, isJP);
    const check_postal_code
      = this.checkNumber(this.state.postal_code, null, isJP);
    const check_birthday
      = this.checkNumber(this.state.year, this.state.day, isJP);

    const toggledButton = this.renderButton(this.state, isJP);
    const popupModal = this.renderModal(this.state, isJP);

    return <form id="user-sign-up"
      onSubmit={this.handleSubmit.bind(this)}>
      {/* Your Informatin */}
      <fieldset className="category-group">
        <legend>お客様の情報</legend>
        <table><tbody>
        <tr>
          <th>
          <label>
          {name} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <div className="multi-field">
          <label htmlFor="first-name">{first_name} </label>
          <input type="text" name="first-name" id="first-name"
            onChange={this.handleChangeText.bind(this, 'first_name')}
            className="name-field last-name required"/>
          <label htmlFor="last-name">{last_name} </label>
          <input type="text" name="last-name" id="last-name"
            onChange={this.handleChangeText.bind(this, 'last_name')}
            className="name-field required"/>
          </div>
          </td>
        </tr>
        <tr>
          <th>{gender}</th>
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
            value={this.state.month}
            onChange={this.handleChangeSelect.bind(this, 'month')}>
          <option value></option>
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
        <tr>
          <th>
          <label htmlFor="phone">
          {phone} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="phone" id="phone"
            onChange={this.handleChangeText.bind(this, 'phone')}
            className=" add-placeholder required"
            placeholder="010-0000-0000"/>
          <span className="notes">{check_phone}</span>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="email">
          {email} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="email" id="email"
            onChange={this.handleChangeText.bind(this, 'email')}
            className="add-placeholder required"
            placeholder="example@example.com"/>
          <span className="notes">{check_email}</span>
          </td>
        </tr>
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
        </tbody></table>
      </fieldset>

      {/* Your Shipping Address */}
      <fieldset className="category-group">
        <legend>ご購入品の配送先</legend>
        <table><tbody>
        <tr>
          <th>
          <label htmlFor="country_code">
          {country_code} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <select name="country_code" id="country_code"
            value={this.state.country_code}
            onChange={this.handleChangeSelect.bind(this, 'country_code')}
            className="required">
          {country}
          </select>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="state">
          {state} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="state" id="state"
            onChange={this.handleChangeText.bind(this, 'state')}
            className="required" />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="postal_code">
          {postal_code} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="postal_code" id="postal_code"
            onChange={this.handleChangeText.bind(this, 'postal_code')}
            className=" add-placeholder required"
            placeholder="100-0000" />
          <span className="notes">{check_postal_code}</span>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="city">
          {city} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="city" id="city"
            onChange={this.handleChangeText.bind(this, 'city')}
            className="required" />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="line1">
          {line1} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="line1" id="line1"
            onChange={this.handleChangeText.bind(this, 'line1')}
            className="required" />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="line2">
          {line2} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="line2" id="line2"
            onChange={this.handleChangeText.bind(this, 'line2')}
            className="required" />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="recipient_name">
          {recipient_name}
          </label>
          </th>
          <td>
          <input type="text" name="recipient_name" id="recipient_name"
            onChange={this.handleChangeText.bind(this, 'recipient_name')}
          />
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* Your Shipping Address */}

      {/* How to buy */}
      <fieldset className="category-group">
        <legend>ご購入方法</legend>
        <table><tbody>
        <tr>
          <th>
          <label htmlFor="quantity">
          {quantity} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <div className="multi-field">
          <span className="quantity-field">
          <select name="quantity" id="quantity"
            value={this.state.quantity}
            onChange={this.handleChangeSelect.bind(this, 'quantity')}
            className="short-field required">
          <option value></option>
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
          <span className="quantity-field">
          <label>{label_quantity}</label>
          </span>
          </div>
          <span className="notes">{notes_quantity}</span>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="payment">
          {payment} <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <select name="payment" id="payment"
            value={this.state.payment}
            onChange={this.handleChangeSelect.bind(this, 'payment')}
            className="middle-field required">
          <option value></option>
          <option value="paypal">クレジットカード（PayPal）</option>
          <option value="deposit">銀行振り込み（前払い）</option>
          <option value="other">その他</option>
          </select>
          <span className="notes">{notes_payment}</span>
          </td>
        </tr>
        </tbody></table>
      </fieldset>
      {/* How to buy */}

      {/* Agreement */}
      <div id="signup-agreement">
        <label>
        <span className="required-mark">required</span>  Agree to our terms of us and privacy policy. <input type="checkbox" name="agreement" id="agreement"
          onChange={this.handleChangeCheckbox.bind(this, 'agreement')}
          className="required"/>
        </label>
      </div>

      {/* Confirm */}
      <div id="signup-next">
      {toggledButton}
      <div ref="signup_next"></div>
      </div>
      {popupModal}
      </form>;
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }
};
export default AppBody;

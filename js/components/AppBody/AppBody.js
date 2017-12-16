import React from 'react';
import ReactDOM from 'react-dom'
import Radio from '../../components/Radio/Radio';
import AppAction from '../../actions/AppAction';
import { log } from '../../utils/webutils';

const pspid = 'AppBodyView';

class AppBody extends React.Component {
  constructor(props) {
    super(props);
    const options = props.options;
    const infomation = options.infomation;
    const details = options.details;
    const item = options.item;
    const shipping_address = options.shipping_address;
    this.payment = {
      total: options.total
      , total_currency: options.currency
      , subtotal: details.subtotal
      , shipping: details.shipping
      , name: item.name
      , description: item.description
      , price: item.price
      , currency: item.currency
    };
    this.state = {
      quantity: item.quantity
      , recipient_name: shipping_address.recipient_name
      , line1: shipping_address.line1
      , line2: shipping_address.line2
      , city: shipping_address.city
      , country_code: shipping_address.country_code
      , postal_code: shipping_address.postal_code
      , phone: shipping_address.phone
      , state: shipping_address.state
      , first_name: infomation.first_name
      , last_name: infomation.last_name
      , gender: infomation.gender
      , year: infomation.year
      , month: infomation.month
      , day: infomation.day
      , email: infomation.email
      , confirm_email: infomation.confirm_email
      , agreement: infomation.agreement
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

  submitHandler(e) {
    e.preventDefault();
    if(!this.isValid(this.state)) return;
    this.logTrace(this.state);
    this.logTrace(this.payment);
  }

  componentDidMount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    const el = this.el = document.createElement('div');
    el.setAttribute('id','paypal-button');
    buttonNode.appendChild(el);
  }

  componentWillUnmount() {
    const buttonNode = ReactDOM.findDOMNode(this.refs.signup_next);
    buttonNode.removeChild(this.el);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.isNotChanged(nextState, this.state);
  }

  componentWillUpdate(nextProps, nextState) {
    const state = nextState;
    const props = nextProps;
    if(!this.isValid(state)) return;

    const curr = props.currency;
    const ship = props.shipping;
    const isJP = obj => obj.country_code.join() === 'JP';
    const isCty = obj => ship.jpp.filter(jpp =>
      jpp.city === obj.city)[0];
    const isEms = obj => ship.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0];
    const isPay = obj => ship.ems.filter(ems =>
      ems.code_2 === state.country_code.join())[0].paypal === 'OK';
    const isMail = state.payment.join() !== 'paypal';
    const price = isJP(state) ? Number(curr.JPY) : Math.ceil(curr.USD);
    const shipping = !isMail
      ? (isJP(state)
        ? (isCty(state) ? Number(isCty(state).price) : 0) 
        : (isEms(state) && isPay(state) ? Number(isEms(state).price) : 0))
      : 0;
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
    const state = this.state;
    const props = this.props;
    if(!this.isValid(state) || !this.payment.shipping) return;
    AppAction.fetchPayment();
  }

  isValid(state) {
    return (
      state.country_code  && (state.country_code.join() !== '')
      && state.city
      && state.quantity   && (state.quantity.join() !== '')
      && state.payment    && (state.payment.join() !== '')
      && state.first_name
      && state.last_name
      && state.phone
      && state.email      && (state.email === state.confirm_email)
      && state.postal_code
      && state.line1
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
      && next.agreement     === prev.agreement   
    );
  }

  checkConfirmEmail(string) {
    return this.state.email !== string
      ? 'メールアドレスを再入力してください。'
      : '';
  }

  checkEmail(string) {
    return !/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(string)
      ? '正しいメールアドレスを入力してください。'
      : '';
  }
  
  checkNumber(string) {
    return !/^[\d,-]+$/.test(string)
      ? "数字を入力して下さい。"
      : '';
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

  renderOption(objs, key, val) {
    if(!objs) return null;
    const opts = objs.map(obj => ({ key: obj[key], val: obj[val] }));
    return opts.map((opt, idx) => (<option
      key={"choice-" + idx} value={opt.val} >{opt.key}</option>));
  }

  renderButton() {
    return this.payment.shipping 
      ? <div id="paypal-button"></div>
      : <input type="submit" value="ご購入" className="button-primary"/>;
  }

  render() {
    this.logTrace(this.state);
    const shipping = this.props.shipping;
    const language = this.props.language;
    const country = language === 'jp' 
      ? this.renderOption(shipping.ems, 'name_jp', 'code_2') 
      : this.renderOption(shipping.ems, 'name_en', 'code_2');

    const usd = Number(this.props.query.usd).toLocaleString();
    const jpy = Number(this.props.query.jpy).toLocaleString();
    const check_email = this.checkEmail(this.state.email);
    const check_confirm_email
      = this.checkConfirmEmail(this.state.confirm_email);
    const check_phone = this.checkNumber(this.state.phone);
    const check_postal_code = this.checkNumber(this.state.postal_code);
    const check_birthday = this.checkNumber(this.state.year);
    const check_day = this.checkNumber(this.state.day);
    const toggleButton = this.renderButton(); 
    return <form id="user-sign-up"
      onSubmit={this.submitHandler.bind(this)}>
      {/* Your Informatin */}
      <fieldset className="category-group">
        <legend>お客様の情報</legend>
        <table><tbody>
        <tr>
          <th>
          <label>
          お名前 <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <div className="multi-field">
          <label htmlFor="first-name">名字 </label>
          <input type="text" name="first-name" id="first-name"
            onChange={this.handleChangeText.bind(this, 'first_name')}
            className="name-field last-name required"/>
          <label htmlFor="last-name">名前 </label>
          <input type="text" name="last-name" id="last-name"
            onChange={this.handleChangeText.bind(this, 'last_name')}
            className="name-field required"/>
          </div>
          </td>
        </tr>
        <tr>
          <th>性別</th>
          <td>
          <div className="gender-field">
          <Radio name="gender"
            value={this.state.gender}
            onChange={this.handleChangeRadio.bind(this, 'gender')} >
            <option value="male" id="gender-male"> 男性 </option>
            <option value="female" id="gender-female"> 女性 </option>
          </Radio>
          </div>
          </td>
        </tr>
        <tr>
          <th>
          <label>誕生日</label>
          </th>
          <td>
          <label htmlFor="year">年 </label>
          <span className="birthday-field">
          <input type="text" name="year" id="year" 
            onChange={this.handleChangeText.bind(this, 'year')}
            className="short-field add-placeholder"
            placeholder="1970"/>
          </span>
          <label htmlFor="month">月 </label>
          <span className="birthday-field">
          <select name="month" id="month" className="short-field"
            value={this.state.month}
            onChange={this.handleChangeSelect.bind(this, 'month')}>
          <option value=""></option>
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
          <label htmlFor="day">日 </label>
          <span className="birthday-field">
          <input type="text" name="day" id="day"
            onChange={this.handleChangeText.bind(this, 'day')}
            className="short-field add-placeholder"
            placeholder="1"/>
          </span>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="phone">
          電話番号 <span className="required-mark">required</span>
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
          メールアドレス <span className="required-mark">required</span>
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
          <label htmlFor="confirm-email">
          メールアドレス 確認 <span className="required-mark">required</span>
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
          国名 <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <select name="country_code" id="country_code"
            value={this.state.country_code}
            onChange={this.handleChangeSelect.bind(this, 'country_code')}
            className="required">
          <option value=""></option>
          <option value="JP">日本</option>
          <option value="MM">ミャンマー</option>
          <option value="TH">タイ</option>
          <option value="CN">中華人民共和国 (中国)</option>
          <option value="SG">シンガポール</option>
          <option value="MY">マレーシア</option>
          <option value="TW">台湾</option>
          <option value="HK">香港</option>
          <option value="VN">ベトナム</option>
          <option value="KR">大韓民国 (韓国)</option>
          {country}
          </select>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="state">州</label>
          </th>
          <td>
          <input type="text" name="state" id="state"
            onChange={this.handleChangeText.bind(this, 'state')} />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="postal_code">
          郵便番号 <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="postal_code" id="postal_code"
            onChange={this.handleChangeText.bind(this, 'postal_code')}
            className=" add-placeholder required"
            placeholder="100-0000"/>
          <span className="notes">{check_postal_code}</span>
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="city">
          都市 <span className="required-mark">required</span>
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
          市区町村 <span className="required-mark">required</span>
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
          地番・部屋番号 <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="line2" id="line2"
            onChange={this.handleChangeText.bind(this, 'line2')}
          />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="recipient_name">
          受取人名義
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
          <label>
          ご購入数 <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <span className="quantity-field">
          <select name="quantity" id="quantity"
            value={this.state.quantity}
            onChange={this.handleChangeSelect.bind(this, 'quantity')}
            className="short-field required">
          <option value=""></option>
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
          <label htmlFor="quantity">
          冊 x {jpy}円（税込／送料別）
          </label>
          <span className="notes">
          日本国外への配送は
          US ${usd}
          を当日レートで日本円に換算した金額のご請求となります。
          </span>
          </td>
        </tr>
        <tr>
          <th>
          <label>
          お支払い方法 <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <select name="payment" id="payment"
            value={this.state.payment}
            onChange={this.handleChangeSelect.bind(this, 'payment')}
            className="middle-field required">
          <option value=""></option>
          <option value="paypal">クレジットカード（PayPal）</option>
          <option value="deposit">銀行振り込み（前払い）</option>
          <option value="other">その他</option>
          </select>
          <span className="notes">
          クレジット決済の場合は
          PayPalアカウント
          が必要となります。
          </span>
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
      <div id="signup-next" ref="signup_next">
      {toggleButton}
      </div>
      </form>;
  }
};
export default AppBody;

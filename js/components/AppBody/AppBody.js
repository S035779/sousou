import React from 'react';
import Radio from '../../components/Radio/Radio';
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
    this.state = {
      total: options.total
      , total_currency: options.currency
      , subtotal: details.subtotal
      , shipping: details.shipping
      , name: item.name
      , description: item.description
      , quantity: item.quantity
      , price: item.price
      , currency: item.currency
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

  renderOption(objs, prop1, prop2) {
    if(!objs) return null;
    const len = arguments.length;
    const items = objs.map(obj => {
      if(!obj.Item.hasOwnProperty('ResultSet')) return null;
      return (len === 2)
        ? obj.Item.ResultSet.Result[prop1]
        : obj.Item.ResultSet.Result[prop1][prop2];
    })
    const opts = std.dst(items);
    return opts.map((opt, idx) => {
      return <option
        key={"choice-" + idx} value={opt} >{opt}</option>;
    })
  }

  submitHandler(e) {
    this.logTrace(this.state);
    e.preventDefault();
    const options = {
      total: this.state.total
      , total_currency: this.state.currency
      , subtotal: this.state.subtotal
      , shipping: this.state.shipping
      , name: this.state.name
      , description: this.state.description
      , quantity: this.state.quantity
      , price: this.state.price
      , currency: this.state.currency
      , recipient_name: this.state.recipient_name
      , line1: this.state.line1
      , line2: this.state.line2
      , city: this.state.city
      , country_code: this.state.country_code
      , postal_code: this.state.postal_code
      , phone: this.state.phone
      , state: this.state.state
      , first_name: this.state.first_name
      , last_name: this.state.last_name
      , gender: this.state.gender
      , year: this.state.year
      , month: this.state.month
      , day: this.state.day
      , email: this.state.email
      , confirm_email: this.state.confirm_email
      , agreement: this.state.agreement
    }
    this.logTrace(options);
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Trace:', message);
  }

  render() {
    log.trace(`${pspid}>`, 'state:', this.state);

    const language = this.props.language;
    //const shipping = this.props.shipping;
    //const country = language === 'jp' 
    //  ? renderOption(shipping, 'name_jp') 
    //  : renderOption(shipping, 'name_en');
    //
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
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="confirm-email">
          確認 メールアドレス <span className="required-mark">required</span>
          </label>
          </th>
          <td>
          <input type="text" name="confirm_email" id="confirm_email"
            onChange={this.handleChangeText.bind(this, 'confirm_email')}
            className="required"/>
          <span className="notes">メールアドレスを再入力して下さい。</span>
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
          <option value="AA">ミャンマー</option>
          <option value="BB">タイ</option>
          <option value="CC">中国</option>
          <option value="DD">シンガポール</option>
          <option value="EE">マレーシア</option>
          <option value="FF">台湾</option>
          <option value="GG">香港</option>
          <option value="HH">ベトナム</option>
          <option value="II">韓国</option>
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
          住所１ <span className="required-mark">required</span>
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
          <label htmlFor="line2">住所２</label>
          </th>
          <td>
          <input type="text" name="line2" id="line2"
            onChange={this.handleChangeText.bind(this, 'line2')}
          />
          </td>
        </tr>
        <tr>
          <th>
          <label htmlFor="recipient_name">受取人</label>
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
          冊 x 72,000円（税込／送料別）
          </label>
          <span className="notes">
          日本国外への配送は、US $600ドルを
          当日レートで日本円に換算した金額のご請求となります。
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
          クレジット決済の場合はPayPalアカウントが
          必要となります。
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
      <div id="signup-next">
      <input type="submit"
         value="ご購入" className="button-primary"/>
      </div>
      </form>;
  }
};
export default AppBody;

import React from 'react';
import { Container } from 'flux/utils';
import appStore from '../../stores/appStore';
import AppAction from '../../actions/AppAction';
import AppHeader from '../../components/AppHeader/AppHeader';
import AppFooter from '../../components/AppFooter/AppFooter';
import AppBody from '../../components/AppBody/AppBody';
import std from '../../utils/stdutils';

class App extends React.Component {
  static getStores() {
    return [appStore];
  }

  static calculateState() {
    return appStore.getState();
  }

  componentDidMount() {
    const search = this.props.location.search.split('?');
    const query = std.decodeFormData(search[1]);
    console.log(query);
    const { length, weight, from, usd, jpy } = query;
    AppAction.fetchShipping({ length, weight, from });
    AppAction.fetchCurrency({ usd, jpy });
  }

  handleChangePayment(event) {
    const { language } = this.props.match.params;
    const search = this.props.location.search.split('?');
    const { usd, jpy } = std.decodeFormData(search[1]);
    const options = {};
    // Create options object...
    AppAction.fetchPayment(options);
  }

  render() {
    const { language } = this.props.match.params;
    return <div id="cb">
      <AppHeader />
      <AppBody
        language={language}
        options={this.state.options}
        currency={this.state.currency}
        shipping={this.state.shipping}
        onChangePayment={this.handleChangePayment.bind(this)} />
      <AppFooter />
      </div>;
  }
}
export default Container.create(App);

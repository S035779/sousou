import querystring from 'querystring';
import React from 'react';
import { Container } from 'flux/utils';
import AppAction from '../../actions/AppAction';
import { getStores, getState } from '../../stores';
import AppHeader from '../../components/AppHeader/AppHeader';
import AppFooter from '../../components/AppFooter/AppFooter';
import AppBody from '../../components/AppBody/AppBody';

class App extends React.Component {
  static getStores() {
    return getStores(['appStore']);
  }

  static calculateState() {
    return getState('appStore');
  }

  static prefetch() {
    const { length, weight, from, usd, jpy } = JSON.parse(
      document.getElementById('initial-data').getAttribute('data-init'));
    AppAction.fetchShipping({ length, weight, from });
    AppAction.fetchCurrency({ usd, jpy });
    return;
  }

  componentDidMount() {
    App.prefetch();
  }

  render() {
    const { language } = JSON.parse(
      document.getElementById('initial-data').getAttribute('data-init'));
    return <div>
      <AppHeader language={language} />
      <AppBody
        language={language}
        usd={this.state.usd}
        jpy={this.state.jpy}
        options={this.state.options}
        currency={this.state.currency}
        shipping={this.state.shipping}
        results={this.state.results} />
      <AppFooter language={language} />
    </div>;
  }
}
export default Container.create(App);

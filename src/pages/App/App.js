import querystring from 'querystring';
import React from 'react';
import { Container } from 'flux/utils';
import appStore from 'Stores/appStore';
import AppAction from 'Actions/AppAction';
import AppHeader from 'Components/AppHeader/AppHeader';
import AppFooter from 'Components/AppFooter/AppFooter';
import AppBody from 'Components/AppBody/AppBody';

class App extends React.Component {
  static getStores() {
    return [appStore];
  }

  static calculateState() {
    return appStore.getState();
  }

  componentDidMount() {
    const { length, weight, from, usd, jpy } = this.props;
    AppAction.fetchShipping({ length, weight, from });
    AppAction.fetchCurrency({ usd, jpy });
  }

  render() {
    const { language } = this.props;
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

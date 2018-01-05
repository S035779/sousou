import querystring from 'querystring';
import React from 'react';
import { Container } from 'flux/utils';
import appStore from '../../stores/appStore';
import AppAction from '../../actions/AppAction';
import AppHeader from '../../components/AppHeader/AppHeader';
import AppFooter from '../../components/AppFooter/AppFooter';
import AppBody from '../../components/AppBody/AppBody';

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
    return <div className="buynow">
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

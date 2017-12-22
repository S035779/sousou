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
    const search = this.props.location.search.split('?');
    const query = querystring.parse(search[1]);
    const { length, weight, from, usd, jpy } = query;
    AppAction.fetchShipping({ length, weight, from });
    AppAction.fetchCurrency({ usd, jpy });
  }

  render() {
    const { language } = this.props.match.params;
    return <div>
      <AppHeader />
      <AppBody
        language={language}
        usd={this.state.usd}
        jpy={this.state.jpy}
        options={this.state.options}
        currency={this.state.currency}
        shipping={this.state.shipping}
        message={this.state.message} />
      <AppFooter />
      </div>;
  }
}
export default Container.create(App);

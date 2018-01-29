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

  static prefetch(props) {
    const { length, weight, from, usd, jpy } = props;
    const shipping = obj => AppAction.fetchShipping(obj);
    const currency = obj => AppAction.fetchCurrency(obj);
    return Promise.all([
      shipping({ length, weight, from })
    , currency({ usd, jpy }
    )])
      .then(() => console.log('Complete!!'))
      .catch(err => console.log(err.name, err.message));
  }

  componentDidMount() {
    App.prefetch(this.props);
  }

  render() {
    const props = this.props;
    return <div>
      <AppHeader {...props} />
      <AppBody {...props}
        options={this.state.options}
        currency={this.state.currency}
        shipping={this.state.shipping}
        results={this.state.results} />
      <AppFooter {...props} />
    </div>;
  }
}
export default Container.create(App);

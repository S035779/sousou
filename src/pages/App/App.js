import querystring    from 'querystring';
import React          from 'react';
import { Container }  from 'flux/utils';
import AppAction      from 'Actions/AppAction';
import { getStores, getState }
                      from 'Stores';
import AppHeader      from 'Components/AppHeader/AppHeader';
import AppFooter      from 'Components/AppFooter/AppFooter';
import AppBody        from 'Components/AppBody/AppBody';
import { log }        from 'Utilities/webutils';

const pspid = 'App';

class App extends React.Component {
  static getStores() {
    return getStores(['appStore']);
  }

  static calculateState() {
    return getState('appStore');
  }

  componentDidMount() {
    const { length, weight, from, usd, jpy } = this.props;
    const shipping = obj => AppAction.fetchShipping(obj);
    const currency = obj => AppAction.fetchCurrency(obj);
    return Promise.all([
      shipping({ length, weight, from })
    , currency({ usd, jpy }
    )])
      .then(() => this.logInfo('prefetch', 'Complete!!'))
      .catch(err => this.logError(err));
  }

  logInfo(name, message) {
    log.info(`${pspid}>`, name, ':', message);
  }

  logError(error) {
    log.error(`${pspid}>`, error.name, ':', error.message);
  }

  render() {
    const props = this.props;
    const { options, currency, shipping, results } = this.state;
    return <div>
      <AppHeader {...props} />
      <AppBody {...props}
        options={options}
        currency={currency}
        shipping={shipping}
        results={results} />
      <AppFooter {...props} />
    </div>;
  }
}
export default Container.create(App);

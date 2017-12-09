import React from 'react';
import { Container } from 'flux/utils';
import appStore from '../../stores/appStore';
import AppAction from '../../actions/AppAction';
import AppHeader from '../../components/AppHeader/AppHeader';
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
    const { id, token } = std.decodeFormData(search[1]);
    AppAction.fetchPayment({ id, token });
    AppAction.fetchCurrency({ id, token });
  }

  render() {
    const { size } = this.props.match.params;
    return (
      <div id={size} className="window">
      <AppHeader />
      <AppBody items={this.state.items}/>
      </div>
    );
  }
}
export default Container.create(App);

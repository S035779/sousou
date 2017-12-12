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
    const { length, weight, from } = std.decodeFormData(search[1]);
    AppAction.fetchShipping({ length, weight, from });
  }

  handleChangeAgree(event) {
    const { language } = this.props.match.params;
    const search = this.props.location.search.split('?');
    const { usd, jpn } = std.decodeFormData(search[1]);
    const options = {};
    // Create options object...
    AppAction.fetchPayment(options);
  }

  render() {
    const { language } = this.props.match.params;
    return (
      <div className="window">
      <AppHeader />
      <AppBody
        language={language}
        onChangeAgree={this.handleChangeAgree.bind(this)} />
      </div>
    );
  }
}
export default Container.create(App);

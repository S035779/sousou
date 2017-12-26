import React from 'react';

class AppHeader extends React.Component {
  render() {
    const language = this.props.language;
    const isJP = language  === 'jp' ? true : false;
    const FormName = isJP
      ? 'ご購入お申込みフォーム'
      : 'Purchase application form';
    const description = isJP
      ? 'こちらからご購入ができます。'
      : 'You can purchase from here.';
    return <header>
      <h1 id="page-title">{FormName}</h1>
      <p>{description}</p>
      </header>;
  }
}
export default AppHeader;

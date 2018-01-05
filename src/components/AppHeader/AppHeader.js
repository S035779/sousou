import React from 'react';

class AppHeader extends React.Component {
  render() {
    const language = this.props.language;
    const isJP = language  === 'jp' ? true : false;
    const title = isJP
      ? '企業年鑑ご購入お申込みフォーム'
      : 'Yearbook purchase application form';
    return <div className="buynowtitle">
      <p>{title}</p>
      </div>;
  }
}
export default AppHeader;
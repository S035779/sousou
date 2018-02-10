import React from 'react';

class AppHeader extends React.Component {
  render() {
    const language = this.props.language;
    const isJP = language  === 'jp' ? true : false;
    const title_head = isJP
      ? '企業年鑑お申込み'
      : 'Yearbook application form';
    const title_body = isJP
      ? 'フォーム'
      : '';
    return <div className="buynowtitle">
      <span>{title_head}</span>
      <span>{title_body}</span>
      </div>;
  }
}
export default AppHeader;

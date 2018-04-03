import React from 'react';
import ini from 'Utilities/config';

class AppHeader extends React.Component {
  translate(label, isJP) {
    return isJP ? ini.translate[label].ja : ini.translate[label].en;
  }

  render() {
    const language = this.props.language;
    const isJP = language  === 'jp' ? true : false;
    const title_head = this.translate('Title_head', isJP);
    const title_body = this.translate('Title_body', isJP);
    return <div className="buynowtitle">
      <span>{title_head}</span>
      <span>{title_body}</span>
    </div>;
  }
}
export default AppHeader;

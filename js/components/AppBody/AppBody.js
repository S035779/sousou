import React from 'react';

class AppBody extends React.Component {
  handleChangeAgree(event) {
    this.props.onChangeAgree();
  }

  render() {
    const language = this.props.language;
    return <div className="contents">
    </div>;
  }
};
export default AppBody;

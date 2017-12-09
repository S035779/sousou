import React from 'react';
import std from '../../utils/stdutils';

class AppBody extends React.Component {
  renderItem(idx, item) {
    return <li className="payment" key={idx}>
      Content {item}</li>;
  }

  render() {
    const objs = this.props.items;
    const items = objs.map((top, idx) => this.renderItem(idx, top));
    return (
      <div className="content">
      <ul>{items}</ul>
      </div>
    );
  }
};
export default AppBody;

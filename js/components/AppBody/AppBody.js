import React from 'react';
import std from '../../utils/stdutils';

class AppBody extends React.Component {
  render() {
    return <div className="content">
      <table>
      <tbody>
      <tr>
      <td>Bass Guitar Strings</td>
      <td>
      <form action="https://www.sandbox.paypal.com/cgi-bin/webscr"
        method="post">
      <input type="hidden" name="cmd" value="_s-xclick" />
      <input type="hidden" name="hosted_button_id"
        value="6RNT8A4HBBJRE" />
      <input type="image"
        src="https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_buynow_107x26.png" 
        alt="Buy Now" />
      <img alt=""  src="https://paypalobjects.com/en_US/i/scr/pixel.gif"
        width="1"  height="1" />
      </form>
      </td>
      </tr>
      </tbody>
      </table>
      </div>;
  }
};
export default AppBody;

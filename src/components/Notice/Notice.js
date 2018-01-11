import React from 'react';
import { log } from 'Utilities/webutils';

const pspid = 'NoticeView';

class Notice extends React.Component {
  handleClickButton(e) {
    this.logInfo('handleClickButton');
    e.preventDefault();
    this.props.onCompleted();
  }

  logInfo(message) {
    log.info(`${pspid}>`, 'Request:', message);
  }

  logTrace(message) {
    log.trace(`${pspid}>`, 'Response:', message);
  }

  logError(error) {
    log.error(`${pspid}>`, error.name, error.message);
  }

  render() {
    const { head, body } = this.props.message;
    return <div className="buynow_contactlast">
      <div id="user-sign-up">
      <fieldset className="category-group">
      <legend>{head}</legend>
      <p>{body}</p>
      </fieldset>
      <div id="signup-next">
      <input type="submit" value="CLOSE"
        onClick={this.handleClickButton.bind(this)}
        className="button-primary"/>
      </div>
      </div>
      </div>;
  }
}
export default Notice;

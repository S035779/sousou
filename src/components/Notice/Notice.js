import React from 'react';
import { log } from 'Utilities/webutils';
import ini from 'Utilities/config';

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

  translate(label, isJP) {
    return isJP ? ini.translate[label].ja : ini.translate[label].en;
  }

  render() {
    const { head, body } = this.props.message;
    const isLangJp = this.props.language === 'jp';
    return <div className="buynow_contactlast">
      <div id="user-sign-up">
      <fieldset className="category-group">
      <legend>{head}</legend>
      <p>{body}</p>
      </fieldset>
      <div id="signup-next">
      <input type="submit"
        value={ this.translate('button_primary_close', isLangJp) }
        onClick={this.handleClickButton.bind(this)}
        className="button-primary"/>
      </div>
      </div>
      </div>;
  }
}
export default Notice;

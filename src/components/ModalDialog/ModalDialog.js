import React from 'react';
import ReactModal from 'react-modal';
import { log } from '../../utils/webutils';

const pspid = 'ModalDialogView';

ReactModal.setAppElement('#app');
ReactModal.defaultStyles = {
  overlay: {
    position: 'fixed',
    top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 99999,
    backgroundColor: 'rgba(0,0,0,0.8)',
    opacity: 1
  },
  content: {
    position: 'relative',
    width: '90%',
    margin: '5% auto 0',
    padding: '5% 0 0',
    borderRadius: '4px',
    background: '#fff'
  }
};
class ModalDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: !!props.showModal
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleAfterOpen = this.handleAfterOpen.bind(this);
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

  handleOpenModal() {
    //this.logInfo('handleOpenModal');
    this.setState({ showModal: true });
  }

  handleAfterOpen() {
    //this.logInfo('handleAfterOpen');
  }

  handleCloseModal() {
    //this.logInfo('handleCloseModal');
    this.setState({ showModal: false });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ showModal: !!nextProps.showModal });
  }

  render() {
    return <ReactModal
        contentLabel="ModalDialog"
        ariaHideApp={true}
        isOpen={this.state.showModal}
        onAfterOpen={this.handleAfterOpen}
        onRequestClose={this.handleCloseModal}
        shouldFocusAfterRender={true}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        shouldReturnFocusAfterClose={true}
        role="dialog"
        parentSelector={() => document.body}
        closeTimeoutMS={0} >
      {this.props.children}
      </ReactModal>;
  }
};
export default ModalDialog;

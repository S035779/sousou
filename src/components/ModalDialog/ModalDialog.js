import React from 'react';
import ReactModal from 'react-modal';

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
    width: '60%',
    margin: '25% auto 0',
    padding: '5%',
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

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleAfterOpen() {
    console.log('handleAfterOpen!!');
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.showModal)
      this.setState({ showModal: !!nextProps.showModal });
  }

  render() {
    return <ReactModal
        //contentLabel="ModalDialog"
        //ariaHideApp={true}
        isOpen={this.state.showModal}
        onAfterOpen={this.handleAfterOpen}
        onRequestClose={this.handleCloseModal}
        shouldFocusAfterRender={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        shouldReturnFocusAfterClose={true}
        //role="dialog"
        //parentSelector={() => document.body}
        //closeTimeoutMS={2}
      >
      {this.props.children}
      <input type="submit" value="SEND"
        onClick={this.handleCloseModal}
        className="button-primary"/>
      </ReactModal>;
  }
};
export default ModalDialog;

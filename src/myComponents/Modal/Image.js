import React from 'react';
import {Modal, } from 'antd';

export default  class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    };
  }


  componentDidMount() {

  }


  closeModal = () => {
    this.setState({
      visible: false,
    });
  }

  openModal = () => {
    this.setState({
      visible: true,
    });
  }


  render() {
    return (
      <div>
        <div onClick={() => this.openModal()}>
          <img alt="" style={{width: 40, height: 40, cursor: 'pointer'}} src={this.props.src}/>
        </div>
        {this.state.visible ?
        <Modal
          footer={null}
          width={600}
          visible={this.state.visible}
          onCancel={() => this.closeModal()}
          destroyOnClose={true}
          maskClosable={true}
        >
          <img alt="" src={this.props.src} style={{width: 550, height: 500}}/>
        </Modal> : null}</div>


    );
  }
}



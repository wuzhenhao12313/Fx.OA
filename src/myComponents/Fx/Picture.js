import React, {PureComponent} from 'react';
import {Modal} from 'antd';
import {String} from '../../utils/rs/Util'
import styles from './index.less';

export default class extends React.Component {
  state = {
    visible: false,
  }

  closeModal = () => {
    this.setState({
      visible: false,
    })
  };

  openModal = () => {
    this.setState({
      visible: true,
    });
  }

  render() {
    const {value, size, modalSize} = this.props;
    const {visible} = this.state;
    return (
      <div className={styles.fxPicture}>
        {String.IsNullOrEmpty(value) ? <div className="noImgDiv" style={{width: size[0], height: size[1]}}></div> : <img
          src={value}
          alt=""
          style={{width: size[0], height: size[1], cursor: 'pointer'}}
          onClick={() => this.openModal()}
        />}
        {visible ? <Modal
          width={modalSize[0]}
          footer={null}
          visible={visible}
          className="ant-modal-picture"
          destroyOnClose
          onCancel={() => this.closeModal()}
        >
          <img
            src={value}
            alt=""
            style={{width: modalSize[0] - 48, height: modalSize[1] - 48, margin: 'auto'}}/>
        </Modal> : null}
      </div>
    )
  }
}

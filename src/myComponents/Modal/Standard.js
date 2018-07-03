import React from 'react';
import {Modal} from 'antd';
import classNames from 'classnames';
import Draggable from 'react-draggable';
import Loader from '../Fx/Loader/';
import {uuid} from '../../utils/rs/Util';
import styles from './index.less';

const Fragment = React.Fragment;

export default class extends React.Component {
  state = {
    uid: '',
  };

  componentDidMount() {
    const uid = uuid();
    this.setState({
      uid,
    });
  }

  render() {
    const {scroll, loading, children, mask, ...restProps} = this.props;
    let needMask = mask === undefined ? true : mask;
    const {uid} = this.state;
    return (
      <div>
        {needMask ? <div className={styles.modalMask}></div> : null}
        <Draggable
          handle=".ant-modal-header"
        >
          <div id={`dragger_${uid}`} className={styles.draggerContainer}>
            <Modal
              destroyOnClose={true}
              maskClosable={false}
              mask={false}
              className={classNames({
                [styles.fxModalStandard]: true,
                ['ant-modal-scroll']: scroll && this.props.footer !== null,
                ['ant-modal-scroll-no-footer']: scroll && this.props.footer === null,
              })}
              getContainer={() => document.getElementById(`dragger_${uid}`)}
              {...restProps}
            >
              <Loader
                spinning={!!loading}
              />
              {children}
            </Modal>
          </div>
        </Draggable>
      </div>
    )
  }
}

import React, {PureComponent} from 'react';
import {Table} from 'antd';
import styles from './index.less';

export default class extends PureComponent {
  render() {
    return (
      <Table className={styles.fxTableBase} {...this.props}/>
    )
  }
}

import React, {PureComponent} from 'react';
import classNames from 'classnames';
import {Pagination} from 'antd';
import styles from './index.less';

export default class extends React.Component {
  render() {
    const {pagination} = this.props;
    const {current, total, pageSize} = pagination;
    return (
      <div className={styles.fxPagination}>
        <div className={classNames({
          ["float-left"]: true,
          [styles.showTotal]: true,
        })}>显示{1 + pageSize * (current - 1)} - {pageSize * current}条记录 | 检索到 {total}条记录
        </div>
        <div className={
          classNames({
            ['float-right']:true,
            [styles.showPage]:true,
          })
        }>
          <Pagination {...pagination}/>
        </div>
      </div>
    )
  }
}

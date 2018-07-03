import React, {PureComponent} from 'react';
import {Row, Col} from 'antd';
import styles from './index.less';
import TableToolBar from './ToolBar';

export default class extends PureComponent {
  render() {
    const {searchForm, tools} = this.props;
    return (
      <div className={styles.tableList}>
        {searchForm ?
          <Row>
            <div className={styles.tableListForm}>
              {searchForm}
            </div>
          </Row> : null
        }
        {
          tools ?
            <Row>
              <div className={styles.tableListOperator}>
                <TableToolBar tools={tools}/>
              </div>
            </Row> : null
        }
        <Row>
          {this.props.children}
        </Row>
      </div>
    );
  }
}

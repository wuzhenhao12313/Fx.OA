import React, {PureComponent} from 'react';
import {Table} from 'antd';

export default class extends PureComponent {

  render() {
    const {rowKey, columns, loading, dataSource} = this.props;
    return (
      <Table
        rowkey={rowKey}
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        pagination={false}
      />
    );
  }
}


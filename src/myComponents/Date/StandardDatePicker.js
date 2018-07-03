import React, {PureComponent} from 'react';
import {DatePicker} from 'antd';

export default class extends React.Component {
  render() {
    return (
      <DatePicker
        format="YYYY-MM-DD"
        allowClear={false}
        {...this.props}
      />
    )
  }
}

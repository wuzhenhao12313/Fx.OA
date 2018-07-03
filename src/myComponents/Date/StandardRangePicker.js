import React, {PureComponent} from 'react';
import moment from 'moment';
import {DatePicker} from 'antd';

const RangePicker = DatePicker.RangePicker;

export default class extends React.Component {
  ranges =
    {
      '近七天': [moment().subtract(7, 'days'), moment()],
      '本月': [moment().startOf('month'), moment().endOf('month')],
      '本年': [moment().startOf('year'), moment().endOf('year')],
    }

  render() {
    return (
      <RangePicker
        format="YYYY-MM-DD"
        ranges={this.ranges}
        allowClear={false}
        {...this.props}
      />
    )
  }
}

import React, {PureComponent} from 'react';
import moment from 'moment';
import {DatePicker} from 'antd';

const RangePicker = DatePicker.RangePicker;

export default class extends React.Component {
  ranges =
    {
      '近七天': [moment().subtract(7, 'days'), moment()],
      '本周': [moment().startOf('week'), moment().endOf('week')],
      '上周': [moment().subtract(1,"week").startOf('week'), moment().subtract(1,"week").endOf('week')],
      '本月': [moment().startOf('month'), moment().endOf('month')],
      '上月': [moment().subtract(1,"month").startOf('month'), moment().subtract(1,"month").endOf('month')],
      '本年': [moment().startOf('year'), moment().endOf('year')],
      '去年': [moment().subtract(1,"year").startOf('year'), moment().subtract(1,"year").endOf('year')],
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

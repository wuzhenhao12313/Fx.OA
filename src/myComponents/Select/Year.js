import React, {PureComponent} from 'react';
import {Select} from 'antd';
import moment from 'moment';

const Option = Select.Option;

export default class extends React.Component {
  state = {
    list: [],
  }

  componentDidMount(){
     const startYear=moment().subtract(10,'year').format('YYYY')*1;
     const endYear=moment().add(10,'year').format('YYYY')*1;
     const list=[];
     for(let i=startYear;i<endYear;i++){
       list.push(i);
     }
     this.setState({
       list,
     });
  }

  render(){
    return(
      <Select
        showSearch
        allowClear
        showArrow
        optionFilterProp="children"
        filterOption={(input, option) => this.searchValues(input, option)}
        {...this.props}
      >
        {this.state.list.map(x => {
          return (
            <Option key={x} value={x}>{`${x}年`}</Option>
          )
        })}
      </Select>
    )
  }
}

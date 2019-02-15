import React, {PureComponent} from 'react';
import {Select,Avatar} from 'antd';
import {fetchService} from '../../utils/rs/Fetch';
import AutoSelect from '../../myComponents/Fx/AutoSelect';
import {createTreeData} from '../../utils/utils';

const Option = Select.Option;

export default class extends React.Component {
  state = {
    list: [],
  }

  componentDidMount() {
    const {workStatusList=[]} = this.props;
    fetchService({
      url: '/Api/User/GetUserList',
      params: {
        workStatusList,
      }
    }).then(data => {
      const {list} = data;
      this.setState({
        list,
      })
    });
  }

  componentWillUnmount() {
    this.setState({
      list: [],
    });
  }

  searchValues = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    return (
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
            <Option key={x.userID} value={x.userID}>{`${x.name}(${x.jobNumber})`}</Option>
          )
        })}
      </Select>
    )
  }

}




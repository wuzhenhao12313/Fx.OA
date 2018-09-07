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
    const {isAllOpen} = this.props;
    if(isAllOpen){
      fetchService({
        url: '/Api/Shop/GetAllOpenShop',
      }).then(data => {
        const {list} = data;
        this.setState({
          list,
        })
      });
    }
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
        placeholder='请选择店铺'
        optionFilterProp="children"
        filterOption={(input, option) => this.searchValues(input, option)}
        {...this.props}
      >
        {this.state.list.map(x => {
          return (
            <Option key={x.shopId} value={x.shopId}>{`${x.shop_name}`}</Option>
          )
        })}
      </Select>
    )
  }

}




import React from 'react';
import {AutoComplete} from 'antd';
import Debounce from 'lodash/debounce';
import {fetchApi} from '../../utils/rs/Fetch';

export default class extends React.Component {
  state = {
    dataSource: [],
  }

  componentDidMount() {

  }

  search = (value) => {
    fetchApi({
      url: '/user/GetUserNameList',
      params: {
        name: value,
      }
    }).then(res => {
      const {data} = res;
      const {list} = data.toObject();
      this.setState({
        dataSource: list,
      });
    });
  }

  render() {
    return (
      <AutoComplete
        dataSource={this.state.dataSource}
        placeholder="输入员工姓名"
        onSearch={this.search}
        {...this.props}
      />
    )
  }
}

import React, {PureComponent} from 'react';
import {TreeSelect} from 'antd';
import {fetchService} from '../../utils/rs/Fetch';
import {createTreeData} from '../../utils/utils';

export default class extends React.Component {
  state = {
    treeList: [],
  }

  componentDidMount() {
    fetchService({
      url: '/Api/Department/Get',
    }).then(data => {
      const {list} = data;

      this.setState({
        treeList: createTreeData(list.toObject(), 'depName', 'depID'),
      })
    });
  }

  componentWillUnmount() {
    this.setState({
      treeList: [],
    });
  }

  render() {
    const {treeList} = this.state;
    return (
      <TreeSelect
        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
        placeholder="请选择部门"
        treeData={treeList}
        {...this.props}
      />
    )
  }

}




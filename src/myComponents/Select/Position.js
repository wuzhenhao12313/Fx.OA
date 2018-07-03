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
      url: '/Api/Position/Get',
    }).then(data => {
      const {list} = data;
      this.setState({
        treeList: createTreeData(list, 'positionName', 'positionID'),
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
        placeholder="请选择职位"
        treeCheckable
        treeCheckStrictly
        treeData={treeList}
        {...this.props}
      />
    )
  }

}




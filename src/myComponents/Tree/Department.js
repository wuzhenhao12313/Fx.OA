import React, {PureComponent} from 'react';
import {Tree, Spin} from 'antd';
import Ant from '../../utils/rs/Ant';
import Config from '../../utils/rs/Config';
import Http from '../../utils/rs/Http';
import {createTree} from '../../utils/utils';
import styles from './index.less';

const TreeNode = Tree.TreeNode;

@Ant.CreateTree()
export default class extends React.Component {
  state = {
    list: [],
    loading: true,
    selectedKeys: [],
  }

  selectKeys = (selectedKeys) => {
    const {handleSelect,current} = this.props;
    if(!current){
      this.setState({
        selectedKeys,
      });
    }
    handleSelect(selectedKeys);
  }

  componentDidMount() {
    this.getRemoteData();
  }

  componentWillUnmount() {
    this.setState({
      list: [],
    });
  }

  getRemoteData = () => {
    Http.Base.Get(Config.GetConfig('fxApi') + '/department/get', {}).then(res => {
      if (res.data) {
        const {data} = res.data;
        const {list} = data.toObject();
        this.setState({
          list: createTree(list.toObject(), 'depID', 'showIndex'),
          loading: false,
        });
      }
    });
  }

  render() {
    const {createAntTree, handleSelect, isParentSelect,current, ...restProps} = this.props;
    const {list, loading} = this.state;
    return (
      <Spin spinning={loading}>
        <Tree
          className={styles.fxTree}
          selectedKeys={current?current:this.state.selectedKeys}
          onSelect={selectedKeys => this.selectKeys(selectedKeys)}
          {...restProps}
        >
          {list.map(dept => {
            return createAntTree(dept, 'depID', 'depName', isParentSelect);
          })}
        </Tree>
      </Spin>
    )
  }
}


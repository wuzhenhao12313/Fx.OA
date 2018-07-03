import React, {PureComponent} from 'react';
import {Tree, Spin} from 'antd';
import Ant from '../../utils/rs/Ant';
import {fetchDict} from '../../utils/rs/Fetch';
import {createTree} from '../../utils/utils';
import styles from './index.less';

const TreeNode = Tree.TreeNode;

@Ant.CreateTree()
export default class extends React.Component {
  state = {
    list: [],
    loading: true,
    expandedKeys: [],
    selectedKeys: [],
  }

  componentDidMount() {
    this.getRemoteData();
  }

  componentWillUnmount() {
    this.setState({
      list: [],
    });
  }

  getExpandedKeys = (data) => {
    const array = [];
    if (data.children) {
      array.push(data['itemCode']);
    }
    return array;
  }

  setExpandedKeys = (expandedKeys) => {
    this.setState({
      expandedKeys,
    })
  };


  getFirstEffectKey = (data) => {
    if (data.children) {
      return this.getFirstEffectKey(data.children[0]);
    }
    return data['itemCode'];
  }

  selectKeys = (selectedKeys) => {
    const {handleSelect, current} = this.props;
    if (!current) {
      this.setState({
        selectedKeys,
      });
    }
    handleSelect(selectedKeys);
  }

  getRemoteData = () => {
    const {typeCode, init, current} = this.props;
    fetchDict({typeCode}).then(data => {
      const list = createTree(data, 'itemID', 'showIndex');
      let expandedKeys = [];
      list.forEach(item => {
        expandedKeys = expandedKeys.concat(this.getExpandedKeys(item));
      });
      this.setState({
        list,
        expandedKeys,
        loading: false,
      }, () => {
        if (init) {
          const code = this.getFirstEffectKey(list[0]);
          this.setState({
            selectedKeys: [code],
          });
          this.selectKeys([code]);
        }
      });
    });
  }

  render() {
    const {
      createAntTree, typeCode, current,
      expand, isParentSelect, init, handleSelect, ...restProps
    } = this.props;
    const {list, loading} = this.state;
    const expandProps = expand ? {
      expandedKeys: this.state.expandedKeys,
      onExpand: expandedKeys => this.setExpandedKeys(expandedKeys),
    } : {};
    return (
      <Spin spinning={loading}>
        <Tree
          className={styles.fxTree}
          selectedKeys={current ? current : this.state.selectedKeys}
          onSelect={selectedKeys => this.selectKeys(selectedKeys)}
          {...expandProps}
          {...restProps}
        >
          {list.map(item => {
            return createAntTree(item, 'itemCode', 'itemName', isParentSelect,);
          })}
        </Tree>
      </Spin>
    )
  }
}


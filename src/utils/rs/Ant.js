import React, {PureComponent} from 'react';
import cloneDeep from 'lodash/cloneDeep'
import {Tree, Select} from 'antd';

const TreeNode = Tree.TreeNode;
const {Option, OptGroup} = Select;

const Ant = {};

Ant.CreateTree = () => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      render() {
        const createAntTree = (dataObj, key, title, isParentSelected) => {
          const data = cloneDeep(dataObj);
          if (data.children) {
            return (
              <TreeNode
                className='ant-tree-node-parent'
                key={data[key]}
                title={data[title]}
                disabled={!isParentSelected}
                selectable={!!isParentSelected}
              >
                {data.children.map(child => {
                  return createAntTree(child, key, title);
                })}
              </TreeNode>
            );
          }
          return (<TreeNode key={data[key]} title={data[title]} isleaf={true}/>);
        }
        return <WrappedComponent createAntTree={createAntTree} {...this.props}/>;
      }
    };
  };
}

Ant.CreateSelect = () => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      render() {
        const createAntSelect = (dataObj, key, title) => {
          const data = cloneDeep(dataObj);
          if (data.children) {
            return (
              <OptGroup  key={key ? data[key] : data} value={key ? data[key] : data} label={title ? data[title] : data}>
                {data.children.map(child => {
                  return createAntSelect(child, key, title);
                })}
              </OptGroup>
            );
          }
          return (
            <Option
              key={key ? data[key] : data}
              value={key ? data[key].toString() : data}>
              {title ? data[title] : data}</Option>);
        }
        return <WrappedComponent createAntSelect={createAntSelect} {...this.props}/>;
      }
    };
  };
}

export default Ant;

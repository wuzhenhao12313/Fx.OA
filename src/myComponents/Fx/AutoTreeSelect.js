import React, {PureComponent} from 'react';
import {TreeSelect} from 'antd';

export default class extends PureComponent {
  render() {
    return (
      <TreeSelect
        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
        placeholder="Please select"
        treeDefaultExpandAll
        {...this.props}
      />
    )
  }
}

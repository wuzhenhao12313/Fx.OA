import React, {PureComponent} from 'react';
import {
  Select,
} from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import {createNav} from '../../utils/utils';
import {fetchDict} from '../../utils/rs/Fetch';
import Ant from '../../utils/rs/Ant';

const Option = Select.Option;

@Ant.CreateSelect()
export default class extends React.Component {
  state = {
    options: [],
    key: 'itemCode',
    label: 'itemName',
  }

  componentDidMount() {
    const {typeCode, data} = this.props;
    if (typeCode) {
      this.getRemoteData(typeCode);
    }
    if (data) {
      this.setState({
        ...data,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      options: [],
    });
  }

  getRemoteData = (typeCode) => {
    fetchDict({typeCode}).then(data => {
      this.setState({
        options: createNav(data, 'parentID', 'itemID'),
      });
    });
  }

  searchValues = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    const {options, key, label} = this.state;
    const {createAntSelect, typeCode, data,ignore=[], ...restProps} = this.props;
    return (
      <Select
        showSearch
        allowClear
        showArrow
        {...restProps}
        optionFilterProp="children"
        filterOption={(input, option) => this.searchValues(input, option)}
      >
        {this.props.children ? this.props.children : options.filter(x=>!ignore.contains(x[key])).map(x => {
          return createAntSelect(x, key, label)
        })}
      </Select>
    )
  }

}

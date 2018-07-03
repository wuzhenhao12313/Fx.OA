import React, {PureComponent} from 'react';
import {Checkbox, Spin} from  'antd';
import cloneDeep from 'lodash/cloneDeep';
import {createNav} from '../../utils/utils';
import {fetchDict} from '../../utils/rs/Fetch';

const CheckGroup = Checkbox.Group;

export default class extends React.Component {
  state = {
    options: [],
    key: 'itemCode',
    label: 'itemName',
    loading: true,
  }

  componentDidMount() {
    const {typeCode, data} = this.props;
    if (typeCode) {
      this.getRemoteData(typeCode);
    }
    if (data) {
      this.setState({
        ...data,
        loading: false,
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
        loading: false,
      });
    });
  }

  render() {
    const {options, key, label} = this.state;
    const props = cloneDeep(this.props);
    delete props.typeCode;
    delete props.data;
    return (
      <Spin spinning={this.state.loading}>
        <CheckGroup {...props}>
          {options.map(x => {
            return <Checkbox key={x[key]} value={x[key]}>{x[label]}</Checkbox>
          })}
        </CheckGroup>
      </Spin>
    )
  }

}

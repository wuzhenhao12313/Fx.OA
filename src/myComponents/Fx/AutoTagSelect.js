import React, {PureComponent} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import {createNav} from '../../utils/utils';
import TagSelect from '../../components/TagSelect/';
import {fetchDict} from '../../utils/rs/Fetch';

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
    const props = cloneDeep(this.props);
    delete props.typeCode;
    delete props.data;
    delete props.createAntSelect;
    return (
      <TagSelect {...props}
      >
        {options.map(x => {
          return <TagSelect.Option key={x[key]} value={x[key]}>{x[label]}</TagSelect.Option>
        })}
      </TagSelect>
    )
  }

}

import React, {PureComponent} from 'react';
import {fetchDict} from '../../utils/rs/Fetch';

const Fragment = React.Fragment;

export default class extends React.Component {
  state = {
    text: null,
  }

  componentDidMount() {
    const {typeCode, itemCode} = this.props;
    fetchDict({typeCode, itemCode}).then(data => {
      const text = data.length > 0 ? data[0].itemName : null;
      this.setState({
        text,
      })
    });
  }

  render() {
    return <Fragment>{this.state.text}</Fragment>;
  }
}

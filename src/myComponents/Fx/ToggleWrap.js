import React, {PureComponent} from 'react';

const Fragment = React.Fragment;

export default class extends React.Component {
  render() {
    const {isShow} = this.props;
    return (
      <Fragment>
        {isShow ? this.props.children : null}
      </Fragment>
    )
  }
}

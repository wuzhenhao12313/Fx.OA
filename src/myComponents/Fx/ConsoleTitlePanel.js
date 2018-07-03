import React, {PureComponent} from 'react';
import classNames from 'classnames';
import styles from './index.less';

export default class extends React.Component {

  render() {
    const {title, right} = this.props;
    return (
      <div className={classNames({
        [styles.consoleTitlePanel]: true,
      })}>
        <div className={styles.title}>
          <div className="float-left">
            {title ? <h5>{title}</h5> : <h5></h5>}
          </div>
          <div className="float-right">
            {right}
          </div>
        </div>
        <div>{this.props.children}</div>
      </div>
    )
  }
}

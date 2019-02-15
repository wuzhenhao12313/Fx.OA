import React, {PureComponent} from 'react';
import {Link,} from 'dva/router';
import {connect} from 'dva';
import classNames from 'classnames';
import PageHeader from '../components/PageHeader';
import styles from './PageHeaderLayout.less';

@connect(state => ({
  collapsed: state.global.collapsed,
}))
export default class extends React.Component {
  state = {
    fold: false,
    unExpandItem: {},
  }

  render() {
    const {children, wrapperClassName, showHeader, top, bg, ...restProps} = this.props;
    return (
      <div className={wrapperClassName}>
        {top}
        <PageHeader {...restProps} linkElement={Link}/>
        {children ? <div id="content-div" className={classNames({
            [styles.content]: true,

            [styles.bg]: !!bg
          }
        )}>
          {children}
        </div> : null}
      </div>
    )
  }
}




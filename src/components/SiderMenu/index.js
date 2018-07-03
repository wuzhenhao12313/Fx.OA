import 'rc-drawer-menu/assets/index.css';
import React, {PureComponent} from 'react';
import SiderMenu from './SiderMenu';
import styles from './index.less';

export default class Index extends PureComponent {
  onCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }

  render() {
    const {collapsed, isMobile, menu,userMenu, routerData,logo} = this.props;
    return (
      <SiderMenu
        {...this.props}
        isMobile={isMobile}
        className={styles.mainSider}
        menu={menu}
        userMenu={userMenu}
        onCollapse={this.onCollapse}
        logo={logo}
      />
    );
  }
}

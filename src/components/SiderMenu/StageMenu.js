import React, {PureComponent} from 'react';
import {Link, routerRedux} from 'dva/router';
import jQuery from 'jquery';
import {connect} from 'dva';
import classNames from 'classnames';
import {Icon, Menu} from 'antd';
import styles from './index.less';
import {menuFormatter, expandMenu, getPathName} from '../../utils/utils';
import Config from '../../utils/rs/Config';
import {IQueryable} from '../../utils/rs/Linq';

const Fragment = React.Fragment;
const {SubMenu} = Menu;
const MenuItemGroup = Menu.ItemGroup;

@connect(state => ({
  userMenu: state.global.userMenu,
  collapsed: state.global.collapsed,
}))
export default class extends React.Component {
  state = {
    fold: false,
    unExpandItem: {},
    currentTopSelectedKeys: [],
  }

  componentDidMount() {
    const pathName = getPathName();
  }

  toggleItem = (menuCode) => {
    const {unExpandItem} = this.state;
    if (unExpandItem[menuCode]) {
      delete unExpandItem[menuCode];
    } else {
      unExpandItem[menuCode] = menuCode;
    }
    this.setState({
      unExpandItem,
    });
  }

  getStageItem = (item) => {
    let {userMenu} = this.props;
    const menuObj = expandMenu(menuFormatter(userMenu));
    const unExpand = this.state.unExpandItem[item.menuCode];
    if (item.children.length > 0) {
      return (
        <li
          key={item.menuCode}
          className={classNames({
              [styles.stageNavItem]: true,
              [styles.stageNavItemSub]: true,
            }
          )}>
          <a onClick={e => this.toggleItem(item.menuCode)}>
            <div className={styles.icon}>
              <Icon
                className={styles.antIcon}
                type={unExpand ? 'caret-right' : 'caret-down'}/>
            </div>
            <div className={styles.title}>{item.name}</div>
          </a>
          <ul className={styles.stageNavItemSub} style={{display: unExpand ? 'none' : 'block'}}>
            {item.children.map(child => {
              return this.getStageItem(child);
            })}
          </ul>
        </li>
      )
    }
    return (
      <li
        key={item.menuCode}
        className={classNames({
            ['stage-item']: true,
            [styles.stageNavItem]: true,
            [styles.stageNavItemSelected]: menuObj[item.menuCode] ? `/${menuObj[item.menuCode].path}` === getPathName() : false,
          }
        )}>
        {menuObj[item.menuCode] ?
          <Link to={`/${menuObj[item.menuCode].path}`}>
            <div className={styles.icon}></div>
            <div className={styles.title}>{item.name}</div>
          </Link> : null}
      </li>
    )
  }

  getTopStageItem = (item) => {
    let {userMenu} = this.props;
    const menuObj = expandMenu(menuFormatter(userMenu));
    if (item.children.length > 0) {
      return (
        <SubMenu title={<span>{item.icon ? <Icon type={item.icon}/> : null}{item.name}</span>}>
          {this.children.map(child => this.getTopStageItem(child))}
        </SubMenu>
      )
    }
    const key = menuObj[item.menuCode] ? `/${menuObj[item.menuCode].path}` : null;
    if (!key) {
      return null;
    }
    return (
      <Menu.Item key={key}>
        <Link to={`/${menuObj[item.menuCode].path}`}>
          {item.icon ?
            <Icon type={item.icon}/>
            : null}
          {item.name}
        </Link>
      </Menu.Item>
    )
  }

  renderStage() {
    let {stage} = this.props;
    let {title, nav} = stage;
    nav = IQueryable(nav).OrderBy("showIndex").ToList();
    return (
      <Fragment>
        <div className={styles.stageTitle}>{title}</div>
        <div className={styles.stageNav}>
          <ul>
            {nav.map((item, index) => {
              return this.getStageItem(item);
            })}
          </ul>
        </div>
      </Fragment>
    )
  }

  renderTopStage() {
    const {collapsed} = this.props;
    let {userMenu} = this.props;
    let {stage} = this.props;
    let {nav} = stage;
    nav = IQueryable(nav).OrderBy("showIndex").ToList();
    return (
      <Menu
        className={classNames(styles.topStage, {
          [styles.collapsed]: collapsed
        })}
        selectedKeys={[getPathName()]}
        mode="horizontal"
      >
        {nav.map(item => {
            return this.getTopStageItem(item)
          }
        )}
      </Menu>
    );
  }

  render() {
    const {stage, collapsed} = this.props;
    const itemNode = jQuery('.stage-item');
    if (Config.webSetting.stageLayout === 'top') {
      const style = {
        width: `calc(100vw - ${!collapsed ? Config.siderBaseWidth : 50}px)`,
        left: !collapsed ? Config.siderBaseWidth : 50
      };
      return (
        <div
          id="stage"
          className={styles.stageTop}
          >
          {this.renderTopStage()}
        </div>
      )
    }

    return (
      <div id="stage" style={{width: this.state.fold || !stage ? 0 : 180}} className={classNames({
        [styles.stage]: true,
        [styles.stageSmall]: itemNode.length >= 10,
        [styles.stageFold]: collapsed,
        [styles.stageUnfold]: !collapsed,
      })}>
        {stage ? this.renderStage() : null}
      </div>
    )
  }
}

import React, {PureComponent} from 'react';
import {Layout, Menu, Icon} from 'antd';
import Debounce from 'lodash-decorators/debounce';
import {Link, routerRedux} from 'dva/router';
import classNames from 'classnames';
import styles from './index.less';
import Uri from '../../utils/rs/Uri';
import Config from '../../utils/rs/Config';
import {fetchProdService} from '../../utils/rs/Fetch';
import {get2LevelRouter} from '../../common/routerData/';
import StageMenu from './StageMenu';

const Fragment = React.Fragment;
const {Sider} = Layout;
const {SubMenu} = Menu;

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      stage: {
        childNavList: [],
        title: '',
      }
    };
  }

  getDefaultCollapsedSubMenus(props) {
    const {location: {pathname}} = props || this.props;
    const snippets = pathname.split('/').slice(1, -1);
    const currentPathSnippets = snippets.map((item, index) => {
      const arr = snippets.filter((_, i) => i <= index);
      return arr.join('/');
    });
    let currentMenuSelectedKeys = [];
    currentPathSnippets.forEach((item) => {
      currentMenuSelectedKeys.push(item);
    });

    if (currentMenuSelectedKeys.length === 0) {
      return ['oa_dashboard'];
    }
    return currentMenuSelectedKeys;
  }

  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach((item) => {
      if (item.children) {
        keys.push(item.path);
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      } else {
        keys.push(item.path);
      }
    });
    return keys;
  }

  getSelectedMenuKeys = (path) => {
    const {menu, routerData} = this.props;
    const flatMenuKeys = this.getFlatMenuKeys(menu);
    let matchPath;
    Object.keys(routerData).every(key => {
      if (Uri.Match(key, path)) {
        matchPath = key;
        return false;
      }
      return true;
    });
    if (routerData[path] || routerData[matchPath]) {
      const {selectedCode} = routerData[path] || routerData[matchPath];
      if (selectedCode) {
        let myKey = [];
        Object.keys(routerData).every(key => {
          if (routerData[key].code === selectedCode) {
            myKey.push(key.substring(1, key.length));
            return false;
          }
          return true;
        });
        return myKey;
      } else {
        if (flatMenuKeys.indexOf(path.replace(/^\//, '')) > -1) {
          return [path.replace(/^\//, '')];
        }
        if (flatMenuKeys.indexOf(path.replace(/^\//, '').replace(/\/$/, '')) > -1) {
          return [path.replace(/^\//, '').replace(/\/$/, '')];
        }
        return flatMenuKeys.filter((item) => {
          const itemRegExpStr = `^${item.replace(/:[\w-]+/g, '[\\w-]+')}$`;
          const itemRegExp = new RegExp(itemRegExpStr);
          return itemRegExp.test(path.replace(/^\//, ''));
        });
      }
    }
  }

  getNavMenuItems(menusData) {
    if (!menusData) {
      return [];
    }
    return menusData.map((item) => {
      if (!item.name) {
        return null;
      }
      let itemPath;
      if (item.path && item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        itemPath = `/${item.path || ''}`.replace(/\/+/g, '/');
      }
      if (item.children && item.children.some(child => child.name)) {
        return item.hideInMenu || item.children.length === 0 ? null : item.parentID === 0 ?
          (
            <SubMenu
              title={
                item.icon ? (
                  <span>
                    <Icon type={item.icon}/>
                    <span>{item.name}</span>
                  </span>
                ) : item.name
              }
              key={item.key || item.path}
            >
              {this.getNavMenuItems(item.children)}
            </SubMenu>
          ) : <Menu.Item key={item.key || item.path} id={item.menuID}>
            {
              /^https?:\/\//.test(itemPath) ? (
                <a href={itemPath} target={item.target}>
                  {item.icon && <Icon type={item.icon}/>}<span>{item.name}</span>
                </a>
              ) : (
                <a
                  target={item.target}
                  replace={itemPath === this.props.location.pathname}
                  onClick={() => this.handleOpenPage(itemPath, item.menuCode, item.name)}
                >
                  {item.icon && <Icon type={item.icon}/>}<span>{item.name}</span>
                </a>
              )
            }
          </Menu.Item>;
      }
      const icon = item.icon && <Icon type={item.icon}/>;
      return item.hideInMenu ? null :
        (
          <Menu.Item key={item.key || item.path} id={item.menuID}>
            {
              /^https?:\/\//.test(itemPath) ? (
                <a href={itemPath} target={item.target}>
                  {icon}<span>{item.name}</span>
                </a>
              ) : (
                <a
                  target={item.target}
                  replace={itemPath === this.props.location.pathname}
                  onClick={() => this.handleOpenPage(itemPath, item.menuCode, item.name)}
                >
                  {icon}<span>{item.name}</span>
                </a>
              )
            }
          </Menu.Item>
        );
    });
  }

  handleOpenChange = (openKeys) => {
    const {menu} = this.props;
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = menu.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
    });
  }

  getChildNav = (menuCode) => {
    return fetchProdService({
      url: '/User/Config/GetUserNavList',
      params: {
        appCode: Config.appCode,
        menuCode,
      }
    });
  }

  handleOpenPage = (path, menuCode, title) => {
    this.getChildNav(menuCode).then(data => {
      const {navList} = data;
      this.setState({
        ...this.state,
        stage: {
          childNavList: navList,
          title,
        }
      });
      const {dispatch} = this.props;
      dispatch(routerRedux.push(path));
    });
  }

  componentDidMount() {
    const {location: {pathname}} = this.props;
    const router = get2LevelRouter();
    let obj;
    Object.keys(router).forEach(key => {
      if (Uri.Match(key, pathname)) {
        obj = {
          ...router[key],
        }
        return false;
      }
      return true;
    });
    if (obj) {
      this.getChildNav(obj.code).then(data => {
        const {navList} = data;
        this.setState({
          ...this.state,
          stage: {
            childNavList: navList,
            title: obj.name,
          }
        });
      });
    }
  }

  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  toggle = () => {
    const {collapsed} = this.props;
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
    this.triggerResizeEvent();
  }

  render() {
    const {collapsed, location: {pathname}, onCollapse, menu, logo} = this.props;
    const {openKeys, stage} = this.state;
    const menuProps = collapsed ? {} : {
      openKeys,
    };
    const stageProps = stage.childNavList.length > 0 ? {stage: {nav: stage.childNavList, title: stage.title}} : {};

    const theme = 'light';
    return (
      <Fragment>
        <Sider
          trigger={null}
          collapsedWidth={50}
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          width={220}
          className={`${styles.sider}`}
        >
          <div className={classNames(styles.logo, {
            [styles.logoDarkTheme]: theme === 'dark',
          })} key="logo">
            <Link to="/">
              <img src={logo} alt="logo"/>
              <h1>{Config.title}</h1>
            </Link>
          </div>
          {/*<div className={styles.siderFold} onClick={e => this.toggle()}>*/}
          {/*<Icon type={collapsed ? 'menu-unfold' : 'menu-fold'}/>*/}
          {/*</div>*/}
          <Menu
            theme={theme}
            mode="inline"
            {...menuProps}
            onOpenChange={this.handleOpenChange}
            selectedKeys={this.getSelectedMenuKeys(pathname)}
            style={{height: 'calc(100vh - 50px)'}}
          >
            {this.getNavMenuItems(menu)}
          </Menu>
        </Sider>
        {stage.childNavList.length > 0 ? <StageMenu {...stageProps}/> : null}
      </Fragment>);
  }
}

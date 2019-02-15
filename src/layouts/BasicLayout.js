import React from 'react';
import PropTypes from 'prop-types';
import {Layout, Icon, Affix, BackTop} from 'antd';
import DocumentTitle from 'react-document-title';
import {connect} from 'dva';
import NProgress from 'nprogress';
import jQuery from 'jquery';
import 'nprogress/nprogress.css';
import {Route, Redirect, Switch} from 'dva/router';
import {ContainerQuery} from 'react-container-query';
import classNames from 'classnames';
import {enquireScreen} from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import {getRoutes} from '../utils/utils';
import Config from '../utils/rs/Config';
import {menuFormatter} from '../utils/utils';
import styles from './BasicLayout.less';
import logo from '../assets/logo.svg';
/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.redirect) {
    redirectData.push({
      from: `${item.path}`,
      to: `${item.redirect}`,
    });
    if (item.children) {
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};

const {Content} = Layout;
const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
let lastHref;
enquireScreen((b) => {
  isMobile = b;
});

@connect(state => ({
  currentUser: state.global.currentUser,
  collapsed: state.global.collapsed,
  stageCollapsed: state.global.stageCollapsed,
  loading: state.loading,
  userMenu: state.global.userMenu,
}))
export default class extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  }

  state = {
    isMobile,
  };

  getChildContext() {
    const {location, routerData} = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }

  timer = 0;

  componentDidMount() {
    const {dispatch, match, routerData} = this.props;


    this.timer = setInterval(() => {
      dispatch({
        type: 'global/stayLogin'
      })
    }, 1000 * 60);

    dispatch({
      type: 'global/getUserInfo'
    });
    dispatch({
      type: 'global/getUserMenu',
      payload: {
        appCode: Config.appCode,
      },
    }).then(() => {
      const _menu = getRoutes(match.path, routerData);
      _menu.forEach(getRedirect);
    });
    enquireScreen((b) => {
      this.setState({
        isMobile: !!b,
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  handleMenuCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }

  getPageTitle() {
    const {routerData, location} = this.props;
    const {pathname} = location;
    let title = Config.title;
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - ${Config.title}`;
    }
    return title;
  }

  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }

  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, routerData, match, location, dispatch, loading, userMenu,
    } = this.props;
    let {hash} = location;
    hash = hash.startsWith('#/') ? hash : `#/${hash}`;
    const href = window.location.href;
    if (lastHref !== href) {
      NProgress.start();
      if (!loading.global) {
        NProgress.done();
        lastHref = href;
      }
      setTimeout(() => {
        NProgress.done();
      }, 10000);
    }
    const layout = (
      <Layout>
        <SiderMenu
          collapsed={collapsed}
          location={location}
          dispatch={dispatch}
          menu={menuFormatter(userMenu)}
          userMenu={userMenu}
          routerData={routerData}
          isMobile={this.state.isMobile}
          logo={logo}
        />
        <Layout>
          <GlobalHeader
            currentUser={currentUser}
            fetchingNotices={fetchingNotices}
            notices={notices}
            collapsed={collapsed}
            dispatch={dispatch}
            isMobile={this.state.isMobile}
            onCollapse={this.handleMenuCollapse}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            onNoticeClear={this.handleNoticeClear}
          />
          <Content
            style={{height: '100%',overflow: 'auto'}}
            className={classNames({
              [styles.contentFold]: collapsed,
              [styles.contentUnfold]: !collapsed,
            })
            }>
            <div style={{marginTop: 64}}>
              <Switch>
                {
                  redirectData.map(item =>
                    <Redirect key={item.from} exact from={item.from} to={item.to}/>
                  )
                }
                {
                  getRoutes(match.path, routerData).map(item => (
                    <Route
                      key={item.key}
                      path={item.path}
                      component={item.component}
                      exact={item.exact}
                    />
                  ))
                }
                <Redirect exact from="/" to={Config.homepage}/>
                <Route render={NotFound}/>
              </Switch>
            </div>
          </Content>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}<BackTop/></div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}


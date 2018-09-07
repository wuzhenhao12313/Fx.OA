import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import { getRouterData } from './common/router';
import Loader from './myComponents/Fx/Loader/';

import styles from './index.less';

dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const BlankLayout = routerData['/blank'].component;
  const UserLayout = routerData['/user'].component;
  const BasicLayout = routerData['/'].component;
  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Route path="/blank" render={props => <BlankLayout {...props} />} />
          <Route path="/user" render={props => <UserLayout {...props} />} />
          <Route path="/" render={props => <BasicLayout {...props} />} />
        </Switch>
      </Router>
    </LocaleProvider>
  );
}

export default RouterConfig;

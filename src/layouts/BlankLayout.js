import React from 'react';
import {BackTop} from 'antd';
import DocumentTitle from 'react-document-title';
import {Route, Redirect, Switch} from 'dva/router';
import Config from "../utils/rs/Config";
import {getRoutes} from "../utils/utils";
import styles from './BlankLayout.less';

export default class extends React.Component{
  getPageTitle() {
    const {routerData, location} = this.props;
    const {pathname} = location;
    let title = Config.title;
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - ${Config.title}`;
    }
    return title;
  }

   render(){
     const { routerData, match } = this.props;
     return(
       <DocumentTitle title={this.getPageTitle()}>
         <div className={styles.blankContainer}>
           {
             getRoutes(match.path, routerData).map(item =>
               (
                 <Route
                   key={item.key}
                   path={item.path}
                   component={item.component}
                   exact={item.exact}
                 />
               )
             )
           }
           <BackTop/>
         </div>
       </DocumentTitle>
     )
   }
};

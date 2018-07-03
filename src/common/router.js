import React from 'react';
import dynamic from 'dva/dynamic';
import {getMenuData} from './menu';
import {getRouter} from './routerData/';

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => dynamic({
  app,
  // eslint-disable-next-line no-underscore-dangle
  models: () => models.filter(m => !app._models.some(({namespace}) => namespace === m)).map(m => import(`../models/${m}.js`)),
  // add routerData prop
  component: () => {
    const p = component();
    return new Promise((resolve, reject) => {
      p.then((Comp) => {
        resolve(props => <Comp {...props} routerData={getRouterData(app)}/>);
      }).catch(err => reject(err));
    });
  },
});

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = item.name;
      keys = {...keys, ...getFlatMenuData(item.children)};
    } else {
      keys[item.path] = item.name;
    }
  });
  return keys;
}

export const getRouterData = (app) => {
  const routerData = {
    '/': {
      component: dynamicWrapper(app, [], () => import('../layouts/BasicLayout')),
    },

    '/user-center': {
      name: '个人中心',
      component: dynamicWrapper(app, ['user_center'], () => import('../routes/UserCenter')),
    },
    ...getRouter({app, dynamicWrapper}),
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () => import('../routes/Exception/triggerException')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/blank': {
      component: dynamicWrapper(app, [], () => import('../layouts/BlankLayout')),
    },
    '/blank/exam/paper/review': {
      name:'预览试卷',
      component: dynamicWrapper(app, ['exam-paper-review'], () => import('../routes/Exam/Paper/Review')),
    },
    '/blank/exam/paper/start': {
      name:'开始考试',
      component: dynamicWrapper(app, ['exam-paper-start'], () => import('../routes/Exam/Start/')),
    },
    '/blank/exam/paper/batch': {
      name:'批卷',
      component: dynamicWrapper(app, ['exam-paper-batch'], () => import('../routes/Exam/BatchCenter/Batch')),
    }
  };
  const menuData = getFlatMenuData(getMenuData());
  const routerDataWithName = {};
  Object.keys(routerData).forEach((item) => {
    routerDataWithName[item] = {
      ...routerData[item],
      name: routerData[item].name || menuData[item.replace(/^\//, '')],
    };
  });
  return routerDataWithName;
};

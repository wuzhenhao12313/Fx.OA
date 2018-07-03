const prefix = '/assess';

export const getAssess= ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/my`]:  {
      name: '我的考评',
      component: dynamicWrapper ? dynamicWrapper(app, ['assess-my'], () => import('../../routes/Assess/My/')) : null,
    },
    [`${prefix}/record`]:  {
      name: '考评统计',
      component: dynamicWrapper ? dynamicWrapper(app, ['assess-record'], () => import('../../routes/Assess/Record/')) : null,
    },
    [`${prefix}/config`]:  {
      name: '考评配置',
      component: dynamicWrapper ? dynamicWrapper(app, ['assess-config'], () => import('../../routes/Assess/Config/')) : null,
    },
  }
}


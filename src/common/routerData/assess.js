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
    [`${prefix}/user`]:  {
      name: '考评人员表',
      component: dynamicWrapper ? dynamicWrapper(app, ['assess-config'], () => import('../../routes/Assess/User/')) : null,
    },
    [`${prefix}/salary`]:  {
      name: '工资核算',
      component: dynamicWrapper ? dynamicWrapper(app, ['assess-salary'], () => import('../../routes/Assess/Salary/')) : null,
    },
  }
}


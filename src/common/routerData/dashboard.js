const prefix = '/dashboard';

export const getDashboard = ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/workplace`]: {
      name: '工作台',
      component: dynamicWrapper ? dynamicWrapper(app, ['dashboard'], () => import('../../routes/Dashboard/Workplace')) : null,
    },
  }
}

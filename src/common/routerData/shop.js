const prefix = '/shop';

export const getShop= ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/weekly-budget`]:  {
      name: '我的周预算',
      component: dynamicWrapper ? dynamicWrapper(app, ['shop-weekly-budget'], () => import('../../routes/Shop/WeeklyBudget/')) : null,
    },
    [`${prefix}/weekly-budget-report`]:  {
      name: '我的周预算',
      component: dynamicWrapper ? dynamicWrapper(app, ['shop-weekly-budget-report'], () => import('../../routes/Shop/WeeklyBudgetReport/')) : null,
    },
  }
}

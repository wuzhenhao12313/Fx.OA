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
    [`${prefix}/grounding/track`]:  {
      name: '铺货跟踪',
      component: dynamicWrapper ? dynamicWrapper(app, ['grounding-track','grounding-asin','grounding-asin-not-download','grounding-asin-data'], () => import('../../routes/Shop/Grounding/track')) : null,
    },
    [`${prefix}/grounding/plan`]:  {
      name: '铺货计划',
      component: dynamicWrapper ? dynamicWrapper(app, ['grounding-plan','grounding-asin','grounding-asin-not-download'], () => import('../../routes/Shop/Grounding/plan')) : null,
    },
    [`${prefix}/grounding/task`]:  {
      name: '我的铺货任务',
      component: dynamicWrapper ? dynamicWrapper(app, ['grounding-task','grounding-asin','grounding-asin-not-download'], () => import('../../routes/Shop/Grounding/task')) : null,
    },
  }
}

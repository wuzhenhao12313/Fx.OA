const prefix = '/materiel';

export const getMateriel= ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/my-apply`]:  {
      name: '我的申请',
      component: dynamicWrapper ? dynamicWrapper(app, ['materiel-apply-my'], () => import('../../routes/Materiel/Apply/my')) : null,
    },
    [`${prefix}/apply`]:  {
      name: '物料申请单',
      component: dynamicWrapper ? dynamicWrapper(app, ['materiel-apply'], () => import('../../routes/Materiel/Apply/')) : null,
    },
    [`${prefix}/count`]:  {
      name: '物料统计',
      component: dynamicWrapper ? dynamicWrapper(app, ['materiel-count'], () => import('../../routes/Materiel/Count/')) : null,
    },
    [`${prefix}/category`]:  {
      name: '物料类型管理',
      component: dynamicWrapper ? dynamicWrapper(app, ['materiel-category'], () => import('../../routes/Materiel/Category/')) : null,
    },
    [`${prefix}/log`]:  {
      name: '出入库日志',
      component: dynamicWrapper ? dynamicWrapper(app, ['materiel-log'], () => import('../../routes/Materiel/Log/')) : null,
    },
    [`${prefix}/data-count`]:  {
      name: '库存情况变动表',
      component: dynamicWrapper ? dynamicWrapper(app, ['materiel-data-count'], () => import('../../routes/Materiel/Count/data')) : null,
    },
  }
}

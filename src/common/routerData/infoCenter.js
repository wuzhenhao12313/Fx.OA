const prefix = '/info-center';

export const getInfoCenter = ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/internal-address`]: {
      name: '内部通讯录',
      component: dynamicWrapper ? dynamicWrapper(app, ['internalAddress'], () => import('../../routes/InfoCenter/InternalAddress')) : null,
    },
  }
}


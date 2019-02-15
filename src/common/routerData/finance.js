const prefix = '/finance';

export const getFinance= ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/contract-pay/detail`]:  {
      name: '采购收货付款',
      component: dynamicWrapper ? dynamicWrapper(app, ['finance_contract-pay'], () => import('../../routes/Finance/ContractPay/index')) : null,
    },
    [`${prefix}/contract-pay/record`]:  {
      name: '付款记录',
      component: dynamicWrapper ? dynamicWrapper(app, ['finance_contract-pay_record'], () => import('../../routes/Finance/ContractPay/record')) : null,
    },
  }
};

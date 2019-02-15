const prefix = '/supply';

export const getSupply= ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/contract`]:  {
      name: '商品采购合同',
      component: dynamicWrapper ? dynamicWrapper(app, ['supply-contract'], () => import('../../routes/Supply/Contract/')) : null,
    },
    [`${prefix}/supplier`]:  {
      name: '供应商管理',
      component: dynamicWrapper ? dynamicWrapper(app, ['supply-supplier'], () => import('../../routes/Supply/Supplier/')) : null,
    },
    [`${prefix}/take-record`]:  {
      name: '收货记录',
      component: dynamicWrapper ? dynamicWrapper(app, ['finance_contract-pay'], () => import('../../routes/Finance/ContractPay/index')) : null,
    },
    [`${prefix}/pay-record`]:  {
      name: '付款记录',
      component: dynamicWrapper ? dynamicWrapper(app, ['finance_contract-pay_record'], () => import('../../routes/Finance/ContractPay/record')) : null,
    },
    [`${prefix}/take-report`]:  {
      name: '采购收货报表',
      component: dynamicWrapper ? dynamicWrapper(app, ['supply-take-report'], () => import('../../routes/Supply/TakeReport/')) : null,
    },
    [`${prefix}/purchase-order`]:  {
      name: '商品采购单',
      component: dynamicWrapper ? dynamicWrapper(app, ['supply-purchase_order'], () => import('../../routes/Supply/Order/')) : null,
    },
    [`${prefix}/order-pay`]:  {
      name: '商品采购已付款',
      component: dynamicWrapper ? dynamicWrapper(app, ['supply-purchase_order_pay'], () => import('../../routes/Supply/OrderPay/')) : null,
    },
    [`${prefix}/order-instock`]:  {
      name: '采购入库确认单',
      component: dynamicWrapper ? dynamicWrapper(app, ['supply-purchase_order_instock'], () => import('../../routes/Supply/OrderInstock/')) : null,
    },
  }
};

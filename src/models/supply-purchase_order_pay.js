import {createModel} from '../utils/rs/Model';
import {getIsPayPurchaseItem,getIsPayBulkItem,createInstockOrder} from '../services/purchase-order';

export default createModel({
  namespace: 'supply-purchase_order_pay',
  initialState: {
    list:[],
  },
  effects: {
    * getIsPayPurchaseItem({payload}, {call, put}) {
      const res = yield call(getIsPayPurchaseItem, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            list,
          },
        });
      }
    },
    * getIsPayBulkItem({payload}, {call, put}) {
      const res = yield call(getIsPayBulkItem, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            list,
          },
        });
      }
    },
    * createInstockOrder({ payload }, { call, }) {
      const res = yield call(createInstockOrder, payload);
      return Promise.resolve(res.success);
    },

  },
});





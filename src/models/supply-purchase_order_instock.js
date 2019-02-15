import {createModel} from '../utils/rs/Model';
import {getInstockList, getBulkInstockItem, getPurchaseInstockItem,getIsPayPurchaseItem,getIsPayBulkItem} from '../services/purchase-order';

export default createModel({
  namespace: 'supply-purchase_order_instock',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    bulkInstockList: [],
    purchaseInstockList: [],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getInstockList, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
          },
        });
      }
    },
    * getBulkInstockItem({payload}, {call, put}) {
      const res = yield call(getBulkInstockItem, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            bulkInstockList: list,
          },
        });
      }
    },

    * getPurchaseInstockItem({payload}, {call, put}) {
      const res = yield call(getPurchaseInstockItem, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            purchaseInstockList: list,
          },
        });
      }
    },
    * getIsPayPurchaseItem({payload}, {call, put}) {
      const res = yield call(getIsPayPurchaseItem, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            purchaseInstockList:list,
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
            bulkInstockList:list,
          },
        });
      }
    },


    * useUpc({payload}, {call,}) {
      const res = yield call(useUpc, payload);
      return Promise.resolve(res.success);
    },

    * returnUpc({payload}, {call,}) {
      const res = yield call(returnUpc, payload);
      return Promise.resolve(res.success);
    },
  },
});





import {createModel} from '../utils/rs/Model';
import {getList,getPurchaseItemListByID,getBulkItemListByID,submitPay,submitInstock} from '../services/purchase-order';

export default createModel({
  namespace: 'supply-purchase_order',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    purchaseItemList:[],
    bulkItemList:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getList, payload);
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
    * getPurchaseItemListByID({payload}, {call, put}) {
      const res = yield call(getPurchaseItemListByID, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            purchaseItemList:list,
          },
        });
      }
    },
    * getBulkItemListByID({payload}, {call, put}) {
      const res = yield call(getBulkItemListByID, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            bulkItemList:list,
          },
        });
      }
    },
    * submitPay({payload}, {call,}) {
      const res = yield call(submitPay, payload);
      return Promise.resolve(res.success);
    },

    * submitInstock({payload}, {call,}) {
      const res = yield call(submitInstock, payload);
      return Promise.resolve(res.success);
    },
  },
});




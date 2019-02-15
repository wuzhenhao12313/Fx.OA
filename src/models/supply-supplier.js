import {createModel} from '../utils/rs/Model';
import {getSupplierList,addSupplier,editSupplier,removeSupplier} from '../services/supply';

export default createModel({
  namespace: 'supply-supplier',
  initialState: {
    data:{
      list:[],
      total:0,
    },
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getSupplierList, payload);
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

    * add({payload}, {call,}) {
      const res = yield call(addSupplier, payload);
      return Promise.resolve(res.success);
    },

    * remove({ payload }, { call, }) {
      const res = yield call(removeSupplier, payload);
      return Promise.resolve(res.success);
    },

    * edit({ payload }, { call, }) {
      const res = yield call(editSupplier, payload);
      return Promise.resolve(res.success);
    },
  },
});





import {createModel} from '../utils/rs/Model';
import {getUpcShop,useUpc,getUpcRole,returnUpc} from '../services/upc';

export default createModel({
  namespace: 'upc-shop',
  initialState: {
    data:{
      list:[],
      total:0,
    },
    role:'',
  },
  effects: {
    * getUpcShop({payload}, {call, put}) {
      const res = yield call(getUpcShop, payload);
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
    * getUpcRole({payload}, {call, put}) {
      const res = yield call(getUpcRole, payload);
      if (res.data) {
        const {role} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            role,
          },
        });
      }
    },
    * useUpc({ payload }, { call, }) {
      const res = yield call(useUpc, payload);
      return Promise.resolve(res.success);
    },

    * returnUpc({ payload }, { call, }) {
      const res = yield call(returnUpc, payload);
      return Promise.resolve(res.success);
    },
  },
});





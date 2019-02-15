import {createModel} from '../utils/rs/Model';
import {getUpcApply, getUpcDepartment, applyUpc, cancelApply,allotUpc,getUpcRole} from '../services/upc';

export default createModel({
  namespace: 'upc-department',
  initialState: {
    applyData:{
      list:[],
      total:0,
    },
    upcData:{
      list:[],
      total:0,
    },
    upcPageIndex:1,
    upcPageSize:10,
    allotList:[],
    role:'',
  },
  effects: {
    * getUpcApply({payload}, {call, put}) {
      const res = yield call(getUpcApply, payload);
      if (res.data) {
        const applyData = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            applyData,
          },
        });
      }
    },
    * getUpcDepartment({payload}, {call, put}) {
      const res = yield call(getUpcDepartment, payload);
      if (res.data) {
        const  upcData = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            upcData,
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
    * applyUpc({ payload }, { call, }) {
      const res = yield call(applyUpc, payload);
      return Promise.resolve(res.success);
    },
    * cancelApply({ payload }, { call, }) {
      const res = yield call(cancelApply, payload);
      return Promise.resolve(res.success);
    },
    * allotUpc({ payload }, { call, }) {
      const res = yield call(allotUpc, payload);
      return Promise.resolve(res.success);
    },
  },
});





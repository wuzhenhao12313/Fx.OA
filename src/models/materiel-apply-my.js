import {createModel} from '../utils/rs/Model';
import {getMyApply, cancelApply, applyMateriel, getCategory,getCountByID} from '../services/materiel';

export default createModel({
  namespace: 'materiel-apply-my',
  initialState: {
    data:{
      list:[],
      total:0,
    },
    categoryList:[],
    currentMaterielCount:null,
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getMyApply, payload);
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
    *getCountByID({payload}, {call, put}) {
      const res = yield call(getCountByID, payload);
      if (res.data) {
        const {count} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            currentMaterielCount:count,
          },
        });
      }
    },

    * add({payload}, {call,}) {
      const res = yield call(applyMateriel, payload);
      const {record} = res.data.toObject();
      return Promise.resolve({success: res.success, record,});
    },

    * cancel({ payload }, { call, }) {
      const res = yield call(cancelApply, payload);
      return Promise.resolve(res.success);
    },
    *getCategoryList({payload}, {call, put}) {
      const res = yield call(getCategory, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            categoryList:list,
          },
        });
      }
    },
  },
});





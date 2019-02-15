import {createModel} from '../utils/rs/Model';
import {getSellExtractListByID,getAssessRecordList} from '../services/assess';

export default createModel({
  namespace: 'assess-salary',
  initialState: {
    recordData:{
      list:[],
      total:0,
    },
    depSellExtractList:[],
    shopSellExtractList:[],
    userSellExtractList:[],
  },
  effects: {
    * getAssessRecordList({payload}, {call, put}) {
      const res = yield call(getAssessRecordList, payload);
      if (res.data) {
        const recordData = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            recordData,
          },
        });
      }
    },
    * getSellExtractListByID({payload}, {call, put}) {
      const res = yield call(getSellExtractListByID, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            ...data,
          },
        });
      }
    },
    * updateManager({payload}, {call, put}) {
      const res = yield call(updateManager, payload);
      return Promise.resolve(res.success);
    },
    * updateEmployee({payload}, {call, put}) {
      const res = yield call(updateEmployee, payload);
      return Promise.resolve({success: res.success});
    },
  },
});




import {createModel} from '../utils/rs/Model';
import {getEffect, getPaperList,createExam,remove} from '../services/exam-record';

export default createModel({
  namespace: 'exam-record',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    paperList: [],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getEffect, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
          }
        })
      }
    },
    * getPaperList({payload}, {call, put}) {
      const res = yield call(getPaperList, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            paperList: list,
          }
        })
      }
    },
    * createExam({payload}, {call, put}) {
      const res = yield call(createExam, payload);
      return Promise.resolve(res.success);
    },
    * remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },
  },
});




import {createModel} from '../utils/rs/Model';
import {get, add, remove, audit,use} from '../services/exam-pc';

export default createModel({
  namespace: 'exam-pc',
  initialState: {
    list: [],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(get, payload);
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

    * add({payload}, {call,}) {
      const res = yield call(add, payload);
      const {record} = res.data.toObject();
      return Promise.resolve({success: res.success, record,});
    },

    * use({ payload }, { call, }) {
      const res = yield call(use, payload);
      return Promise.resolve(res.success);
    },

    * remove({ payload }, { call, }) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },

    * audit({ payload }, { call, }) {
      const res = yield call(audit, payload);
      return Promise.resolve(res.success);
    },
  },
});





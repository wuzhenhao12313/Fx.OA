import {createModel} from '../utils/rs/Model';
import Uri from '../utils/rs/Uri';
import Config from '../utils/rs/Config';
import {get, add, edit, remove} from '../services/employee-insurance';
import {getInfoByNo} from '../services/employee';

export default createModel({
  namespace: 'employee-insurance',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    currentUserInfo: {},
    filters: {
      status: null,
      city: null,
      area: null,
    },
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(get, payload);
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
    *getInfoByNo({payload}, {call, put}) {
      const res = yield call(getInfoByNo, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {employee} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            currentUserInfo: employee,
          },
        });
      }
    },
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve(res.success);
    },
    *edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve(res.success);
    },
    *stop({payload}, {call, put}) {
      const res = yield call(stop, payload);
      return Promise.resolve(res.success);
    },
    *remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },

  },
});




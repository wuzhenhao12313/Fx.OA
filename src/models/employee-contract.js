import {createModel} from '../utils/rs/Model';
import Uri from '../utils/rs/Uri';
import Config from '../utils/rs/Config';
import {get, getCount, add,edit, remove, saveRemark, stop,updateStopDate,cancelStop} from '../services/employee-contract';
import {getInfoByNo} from '../services/employee';

export default createModel({
  namespace: 'employee-contract',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    count: {
      all: 0,
      willEffect: 0,
      effect: 0,
      willExpire: 0,
      expire: 0,
      stop: 0,
    },
    searchValues: {
      date: null,
      jobNumber: '',
      empName: '',
      dateType: 'start',
      contractRange: '',
    },
    currentUserInfo: {}
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
        yield put({
          type: 'getCount',
        })
      }
    },
    *getCount({payload}, {call, put}) {
      const res = yield call(getCount, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            count: {
              ...data,
            }
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
    *saveRemark({payload}, {call, put}) {
      const res = yield call(saveRemark, payload);
      return Promise.resolve(res.success);
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
    *updateStopDate({payload}, {call, put}) {
      const res = yield call(updateStopDate, payload);
      return Promise.resolve(res.success);
    },
    *cancelStop({payload}, {call, put}) {
      const res = yield call(cancelStop, payload);
      return Promise.resolve(res.success);
    },
    *remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },
  },
});




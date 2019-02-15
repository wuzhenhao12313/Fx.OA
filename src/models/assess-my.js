import {createModel} from '../utils/rs/Model';
import {getMyAssess, update, updateEmployee, updateManager} from '../services/assess';

export default createModel({
  namespace: 'assess-my',
  initialState: {
    isDepManager: false,
    list: [],
    type:-1,
  },
  effects: {
    * getMyAssess({payload}, {call, put}) {
      const res = yield call(getMyAssess, payload);
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




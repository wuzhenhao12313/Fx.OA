import {createModel} from '../utils/rs/Model';
import {get,editProbationDate,probationUser} from "../services/employee";

export default createModel({
  namespace: 'employee-probation',
  initialState: {
    data:{
      list:[],
      total:0,
    }
  },
  effects: {
    * get({payload}, {call, put}) {
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
    * editProbationDate({payload}, {call, put}) {
      const res = yield call(editProbationDate, payload);
      return Promise.resolve(res.success);
    },
    * probationUser({payload}, {call, put}) {
      const res = yield call(probationUser, payload);
      return Promise.resolve(res.success);
    },
  },
});




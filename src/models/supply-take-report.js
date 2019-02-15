import {createModel} from '../utils/rs/Model';
import {getTakeReport} from '../services/supply';

export default createModel({
  namespace: 'supply-take-report',
  initialState: {
    list:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getTakeReport, payload);
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
  },
});





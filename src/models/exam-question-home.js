import {createModel} from '../utils/rs/Model';
import {get} from '../services/internalAddress';

export default createModel({
  namespace: 'exam-question-home',
  initialState: {
    data: {
      list: [],
      total: 0,
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
  },
});




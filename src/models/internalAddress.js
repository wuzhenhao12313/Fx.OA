import {createModel} from '../utils/rs/Model';
import {get} from '../services/internalAddress';

export default createModel({
  namespace: 'internalAddress',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    searchValues: {
      userName: '',
    }
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




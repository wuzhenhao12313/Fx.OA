import {createModel} from '../utils/rs/Model';
import {getPage} from '../services/unusual-action-service';

export default createModel({
  namespace: 'employee-unusual-action',
  initialState: {
    data: {
      list: [],
      total: 0,
    }
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getPage, payload);
      if (res.data) {
        const {list, total} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data: {
              list,
              total,
            }
          },
        });
      }
    },
  },
});




import {createModel} from '../utils/rs/Model';
import {getReport} from '../services/shop-weekly-budget';

export default createModel({
  namespace: 'shop-weekly-budget-report',
  initialState: {
    data: {
      list: [],
    },
  },
  effects: {
    * getReport({payload}, {call, put}) {
      const res = yield call(getReport, payload);
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




import {createModel} from '../utils/rs/Model';
import {getMyRecord, apply,cancel} from '../services/shop-weekly-budget';

export default createModel({
  namespace: 'shop-weekly-budget',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
  },
  effects: {
    * getMyRecord({payload}, {call, put}) {
      const res = yield call(getMyRecord, payload);
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
    * apply({payload}, {call, put}) {
      const res = yield call(apply, payload);
      return Promise.resolve({success: res.success, record: res.data.toObject().record});
    },
    * cancel({payload}, {call, put}) {
      const res = yield call(cancel, payload);
      return Promise.resolve(res.success);
    },
  },
});




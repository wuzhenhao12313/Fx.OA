import {createModel} from '../utils/rs/Model';
import {getMaterielDataCount} from '../services/materiel';

export default createModel({
  namespace: 'materiel-data-count',
  initialState: {
    list:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getMaterielDataCount, payload);
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





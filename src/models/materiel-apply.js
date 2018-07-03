import {createModel} from '../utils/rs/Model';
import {getApply,applyMateriel,auditApply,} from '../services/materiel';

export default createModel({
  namespace: 'materiel-apply',
  initialState: {
    data:{
      list:[],
      total:0,
    },
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getApply, payload);
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

    * audit({ payload }, { call, }) {
      const res = yield call(auditApply, payload);
      return Promise.resolve(res.success);
    },
  },
});





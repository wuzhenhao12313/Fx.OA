import {createModel} from '../utils/rs/Model';
import {getInOutLog} from '../services/materiel';

export default createModel({
  namespace: 'materiel-log',
  initialState: {
    data:{
      list:[],
      total:0,
    }
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getInOutLog, payload);
      if (res.data) {
        const {list,total} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data:{
              list,
              total,
            }
          },
        }) ;
      }
    },
  },
});





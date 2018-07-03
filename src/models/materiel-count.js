import {createModel} from '../utils/rs/Model';
import {getMaterielCount,addMaterielIns,getCategory} from '../services/materiel';

export default createModel({
  namespace: 'materiel-count',
  initialState: {
    list:[],
    categoryList:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getMaterielCount, payload);
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

    * add({payload}, {call,}) {
      const res = yield call(addMaterielIns, payload);
      return Promise.resolve(res.success);
    },

    *getCategoryList({payload}, {call, put}) {
      const res = yield call(getCategory, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            categoryList:list,
          },
        });
      }
    },

  },
});





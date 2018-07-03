import {createModel} from '../utils/rs/Model';
import {createCategory,editCategory,removeCategory,getCategory} from '../services/materiel';

export default createModel({
  namespace: 'materiel-category',
  initialState: {
    list:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getCategory, payload);
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
      const res = yield call(createCategory, payload);
      return Promise.resolve(res.success);
    },

    * edit({ payload }, { call, }) {
      const res = yield call(editCategory, payload);
      return Promise.resolve(res.success);
    },

    * remove({ payload }, { call, }) {
      const res = yield call(removeCategory, payload);
      return Promise.resolve(res.success);
    },
  },
});





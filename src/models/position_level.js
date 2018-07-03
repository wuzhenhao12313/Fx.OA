import {createModel} from '../utils/rs/Model';
import Uri from '../utils/rs/Uri';
import Config from '../utils/rs/Config';
import {get, add, edit, remove, getLevelSalary,saveLevelSalary} from '../services/position_level';

export default createModel({
  namespace: 'position_level',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    current:'business',
    selectItems: [],
    salaryList:[],
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
    *getLevelSalary({payload}, {call, put}) {
      const res = yield call(getLevelSalary, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {salaryList} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            salaryList,
          },
        });
      }
    },
    *saveLevelSalary({payload}, {call, put}) {
      const res = yield call(saveLevelSalary, payload);
      return Promise.resolve(res.success);
    },
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve(res.success);
    },
    *edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve(res.success);
    },
    *remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },
  },

  subscriptions: {
    setup({history, dispatch}) {
      return history.listen(({pathname, search}) => {
        const match = Uri.Match('/hr/position-level/:type', pathname);
        let code, menuCode;
        if (match) {
          code = match[1];
          menuCode = `oa_position_level_${code}`;
        }
        if (code) {
          dispatch({
            type: 'validMenuAuth',
            payload: {
              appCode: Config.appCode,
              menuCode,
            },
          });
        }
      });
    },
  },
});




import {createModel} from '../utils/rs/Model';
import {getConfig} from '../services/assess-config';
import {getRecordUserList} from '../services/assess';

export default createModel({
  namespace: 'assess-config',
  initialState: {
    config: [],
    recordUserList:[],
  },
  effects: {
    * getConfig({payload}, {call, put}) {
      const res = yield call(getConfig, payload);
      if (res.data) {
        const {config} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            config,
          },
        });
      }
    },
    * getRecordUserList({payload}, {call, put}) {
      const res = yield call(getRecordUserList, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            recordUserList:list,
          },
        });
      }
    },
  },
});




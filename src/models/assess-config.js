import {createModel} from '../utils/rs/Model';
import {getConfig,getUserConfig,getConfigByUserID,setConfig} from '../services/assess-config';
import {getRecordUserList, updateEmployee} from '../services/assess';

export default createModel({
  namespace: 'assess-config',
  initialState: {
    config: [],
    recordUserList:[],
    assessUserList:[],
    currentConfig:{},
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
    * getUserConfig({payload}, {call, put}) {
      const res = yield call(getUserConfig, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            assessUserList:list,
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
    * getConfigByUserID({payload}, {call, put}) {
      const res = yield call(getConfigByUserID, payload);
      if (res.data) {
        const {config} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            currentConfig:config,
          },
        });
      }
    },
    * setConfig({payload}, {call, put}) {
      const res = yield call(setConfig, payload);
      return Promise.resolve({success: res.success});
    },
  },
});




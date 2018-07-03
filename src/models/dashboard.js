import {createModel} from '../utils/rs/Model';
import {getWorkPlaceConfig, getWorkFlow} from '../services/dashboard';
import {getLog, audit} from '../services/flow';

export default createModel({
  namespace: 'dashboard',
  initialState: {
    noticeList: [],
    flow: {
      list: [],
      total: 0,
    },
    flowPageSize: 3,
    flowPageIndex: 1,
    logList: [],
  },
  effects: {
    * getWorkPlaceConfig({payload}, {call, put}) {
      const res = yield call(getWorkPlaceConfig, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {notice} = data;
        if (notice) {
          const {result} = notice.toObject();
          const {blackboard_list} = result;
          yield put({
            type: 'setStateOk',
            payload: {
              noticeList: blackboard_list,
            },
          });
        }

      }
    },
    * getWorkFlow({payload}, {call, put}) {
      const res = yield call(getWorkFlow, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {list, total} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            flow: {
              list,
              total,
            },
          },
        });

      }
    },
    * getLog({payload}, {call, put}) {
      const res = yield call(getLog, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {log} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            logList: log,
          },
        });
      }
    },
    * audit({payload}, {call, put}) {
      const res = yield call(audit, payload);
      return Promise.resolve({success: res.success});
    },
  }
});


import {createModel} from '../utils/rs/Model';
import {getCyclePlan, getPlanDetail, getPlanItemAsin, runDownloading,switchPlan} from '../services/grounding';

export default createModel({
  namespace: 'grounding-track',
  initialState: {
    list: [],
    userList: [],
    detailList: [],
    asinList: [],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getCyclePlan, payload);
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
    * getPlanDetail({payload}, {call, put}) {
      const res = yield call(getPlanDetail, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            detailList: list,
          },
        });
      }
    },
    * getPlanItemAsin({payload}, {call, put}) {
      const res = yield call(getPlanItemAsin, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            asinList: list,
          },
        });
      }
    },
    * switchPlan({payload}, {call, put}){
      const res = yield call(switchPlan, payload);
      return Promise.resolve(res.success);
    },
    * runDownloading({payload}, {call, put}) {
      const res = yield call(runDownloading, payload);
      return Promise.resolve(res.success);
    },
  },
});




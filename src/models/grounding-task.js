import {createModel} from '../utils/rs/Model';
import {getCurrentTask, getMyPlanDetail, getPlanItemAsin, addAsin, editAsin, removeAsin,moveAsin} from '../services/grounding';

export default createModel({
  namespace: 'grounding-task',
  initialState: {
    data:{
      list:[],
      total:0,
    },
    userList:[],
    detailList:[],
    asinList:[],
  },
  effects: {
    * getMyPlanDetail({payload}, {call, put}) {
      const res = yield call(getMyPlanDetail, payload);
      if (res.data) {
        const data= res.data.toObject();
        console.log(data)
        yield put({
          type: 'setStateOk',
          payload: {
            data,
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
            asinList:list,
          },
        });
      }
    },
    * addAsin({payload}, {call, put}) {
      const res = yield call(addAsin, payload);
      return Promise.resolve(res.success);
    },
    * editAsin({payload}, {call, put}) {
      const res = yield call(editAsin, payload);
      return Promise.resolve(res.success);
    },
    * removeAsin({payload}, {call, put}) {
      const res = yield call(removeAsin, payload);
      return Promise.resolve(res.success);
    },
    * moveAsin({payload}, {call, put}) {
      const res = yield call(moveAsin, payload);
      return Promise.resolve(res.success);
    },
  },
});




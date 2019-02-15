import {createModel} from '../utils/rs/Model';
import {getAsinList, getPAsinDetail, switchPlan, switchUnder,refreshAsinByID,downloadAsinByID} from '../services/grounding';

export default createModel({
  namespace: 'grounding-asin',
  initialState: {
    data:{
      list:[],
      total:0,
      isSaleNum:0,
      orderMoney:0,
      orderNum:0,
    },
    detailData:{
      list:[],
      total:0,
      orderTotal:0,
      productTotal:0,
      asinNum:0,
    },
    detailPageIndex:1,
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getAsinList, payload);
      if (res.data) {
        const data= res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
          },
        });
      }
    },
    * getPAsinDetail({payload}, {call, put}) {
      const res = yield call(getPAsinDetail, payload);
      if (res.data) {
        const detailData= res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            detailData,
          },
        });
      }
    },
    * switchUnder({payload}, {call, put}){
      const res = yield call(switchUnder, payload);
      return Promise.resolve(res.success);
    },
    * refreshAsinByID({payload}, {call, put}){
      const res = yield call(refreshAsinByID, payload);
      return Promise.resolve(res.success);
    },
    * downloadAsinByID({payload}, {call, put}){
      const res = yield call(downloadAsinByID, payload);
      return Promise.resolve(res.success);
    },
  },

});




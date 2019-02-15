import {createModel} from '../utils/rs/Model';
import {editAsin, getNotDownloadAsinList, switchUnder,downloadAsinByID} from '../services/grounding';

export default createModel({
  namespace: 'grounding-asin-not-download',
  initialState: {
    data:{
      list:[],
      total:0,
      isSaleNum:0,
    },
    detailData:{
      list:[],
      total:0,
      orderTotal:0,
      productTotal:0,
    },
    detailPageIndex:1,
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getNotDownloadAsinList, payload);
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
    * editAsin({payload}, {call, put}) {
      const res = yield call(editAsin, payload);
      return Promise.resolve(res.success);
    },
    * switchUnder({payload}, {call, put}){
      const res = yield call(switchUnder, payload);
      return Promise.resolve(res.success);
    },
    * downloadAsinByID({payload}, {call, put}){
      const res = yield call(downloadAsinByID, payload);
      return Promise.resolve(res.success);
    },
  },

});




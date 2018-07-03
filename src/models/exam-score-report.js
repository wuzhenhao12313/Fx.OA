import {createModel} from '../utils/rs/Model';
import {getScoreReport} from '../services/exam-record';

export default createModel({
  namespace: 'exam-score-report',
  initialState: {
    list:[],
  },
  effects: {
    * getScoreReport({payload}, {call, put}) {
      const res = yield call(getScoreReport, payload);
      if (res.data) {
        const { list } = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            list,
          },
        });
      }
    },
  },
});





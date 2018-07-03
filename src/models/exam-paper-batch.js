import {createModel} from '../utils/rs/Model';
import {getBatchItem,updateBatchQuestionList,submitBatch} from '../services/exam-record';

export default createModel({
  namespace: 'exam-paper-batch',
  initialState: {
    paperIns: {},
    questionInsList:[],
  },
  effects: {
    * getBatchItem({payload}, {call, put}) {
      const res = yield call(getBatchItem, payload);
      if (res.data) {
        const { paperIns, questionInsList } = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            paperIns,
            questionInsList,
          },
        });
      }
    },
    * updateBatchQuestionList({payload}, {call,}) {
      const res = yield call(updateBatchQuestionList, payload);
      return Promise.resolve(res.success);
    },
    * submitBatch({payload}, {call,}) {
      const res = yield call(submitBatch, payload);
      return Promise.resolve(res.success);
    },
  },
});





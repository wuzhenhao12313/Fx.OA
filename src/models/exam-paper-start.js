import {createModel} from '../utils/rs/Model';
import {get, add, getStartPaper,updateQuestionInsList,submit} from '../services/exam-pc';

export default createModel({
  namespace: 'exam-paper-start',
  initialState: {
    list: [],
    hasAuth: false,
    authMsg:'',
    paperIns: {},
    questionInsList: [],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(get, payload);
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
    * add({payload}, {call,}) {
      const res = yield call(add, payload);
      const {record} = res.data.toObject();
      return Promise.resolve({success: res.success, record,});
    },
    * updateQuestionInsList({payload}, {call,}) {
      const res = yield call(updateQuestionInsList, payload);
      return Promise.resolve(res.success);
    },
    * submit({payload}, {call,}) {
      const res = yield call(submit, payload);
      return Promise.resolve(res.success);
    },
    * getStartPaper({payload}, {call,put}) {
      const res = yield call(getStartPaper, payload);
      const data = res.data.toObject();
      yield put({
        type: 'setState',
        payload: {
          ...data,
        }
      });
    }
  },
});





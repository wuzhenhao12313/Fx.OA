import {createModel} from '../utils/rs/Model';
import {add} from '../services/exam-record';

export default createModel({
  namespace: 'exam-reg-center',
  initialState: {

  },
  effects: {
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve({success:res.success,record:res.data.toObject().record})
    },
  },
});




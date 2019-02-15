import {createModel} from '../utils/rs/Model';
import {editPay, getPayRecord,removePay} from '../services/supply';

export default createModel({
  namespace: 'finance_contract-pay_record',
  initialState: {
    data: {
      list: [],
      total: 0,
      payMoney:0,
    },
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getPayRecord, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
          },
        });
      }
    },
    * editPay({payload}, {call,}) {
      const res = yield call(editPay, payload);
      return Promise.resolve(res.success);
    },

    * removePay({payload}, {call,}) {
      const res = yield call(removePay, payload);
      return Promise.resolve(res.success);
    },
  },
});




import {createModel} from '../utils/rs/Model';
import {getNeedPayProductTake, payMoney,editPay,getPayByTakeID,getNoPayCount,getContractAdanvePay} from '../services/supply';

export default createModel({
  namespace: 'finance_contract-pay',
  initialState: {
   data:{
     list:[],
     total:0,
     takeCount:0,
     money:0,
   },
    payRecord:{},
    contractCount:0,
    takeCount:0,
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getNeedPayProductTake, payload);
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

    * getPayByTakeID({payload}, {call, put}) {
      const res = yield call(getPayByTakeID, payload);
      if (res.data) {
        const {record} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            payRecord:record,
          },
        });
      }
    },

    * getContractAdanvePay({payload}, {call, put}) {
      const res = yield call(getContractAdanvePay, payload);
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

    * getNoPayCount({payload}, {call, put}) {
      const res = yield call(getNoPayCount, payload);
      if (res.data) {
        const {contractCount,takeCount} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            contractCount,
            takeCount,
          },
        });
      }
    },

    * payMoney({payload}, {call,}) {
      const res = yield call(payMoney, payload);
      return Promise.resolve(res.success);
    },
    * editPay({payload}, {call,}) {
      const res = yield call(editPay, payload);
      return Promise.resolve(res.success);
    },

  },
});





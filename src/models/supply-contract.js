import {createModel} from '../utils/rs/Model';
import {
  getProductPurchaseContractList,
  removeContract,
  editContract,
  addContract,
  getContractDetailByID,
  getContractDetailByIDInCreate,
  removeContractCondition,
  addContractCondition,
  editContractCondition,
  addContractItem,
  editContractItem,
  removeContractItem,
  submitContract,
  takeProduct,
  getTakeProductBatchByItemID,
  getPayByTakeID,
  removeTake,
  getAllSupplier,
  editContractInfo,
  payMoney,
  getPayRecordByContractID, editPay, removePay,
} from '../services/supply';

export default createModel({
  namespace: 'supply-contract',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    itemList: [],
    conditionList: [],
    itemTakeProductBatchList:[],
    payRecord:{},
    supplierList:[],
    allContractMoney:0,
    allPayMoney:0,
    allProductNum:0,
    allTakeNum:0,
    payList:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getProductPurchaseContractList, payload);
      if (res.data) {
        const {list, total, ...restProps} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data:{
              list,
              total,
            },
            ...restProps,
          },
        });
      }
    },
    * getContractDetailByID({payload}, {call, put}) {
      const res = yield call(getContractDetailByID, payload);
      if (res.data) {
        const {itemList} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            itemList,
          },
        });
      }
    },

    * getContractDetailByIDInCreate({payload}, {call, put}) {
      const res = yield call(getContractDetailByIDInCreate, payload);
      if (res.data) {
        const {itemList,conditionList} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            itemList,
            conditionList,
          },
        });
      }
    },

    * getTakeProductBatchByItemID({payload}, {call, put}) {
      const res = yield call(getTakeProductBatchByItemID, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            itemTakeProductBatchList:list,
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
    * getAllSupplier({payload}, {call, put}) {
      const res = yield call(getAllSupplier, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            supplierList:list,
          },
        });
      }
    },
    * getPayRecordByContractID({payload}, {call, put}) {
      const res = yield call(getPayRecordByContractID, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            payList:list,
          },
        });
      }
    },
    * addContract({payload}, {call, put}) {
      const res = yield call(addContract, payload);
      return Promise.resolve(res.success);
    },
    * editContract({payload}, {call, put}) {
      const res = yield call(editContract, payload);
      return Promise.resolve(res.success);
    },
    * removeContract({payload}, {call, put}) {
      const res = yield call(removeContract, payload);
      return Promise.resolve(res.success);
    },
    * submitContract({payload}, {call, put}) {
      const res = yield call(submitContract, payload);
      return Promise.resolve(res.success);
    },
    * addContractCondition({payload}, {call, put}) {
      const res = yield call(addContractCondition, payload);
      return Promise.resolve({...res});
    },
    * editContractCondition({payload}, {call, put}) {
      const res = yield call(editContractCondition, payload);
      return Promise.resolve(res.success);
    },
    * removeContractCondition({payload}, {call, put}) {
      const res = yield call(removeContractCondition, payload);
      return Promise.resolve(res.success);
    },
    * addContractItem({payload}, {call, put}) {
      const res = yield call(addContractItem, payload);
      return Promise.resolve({...res});
    },
    * editContractItem({payload}, {call, put}) {
      const res = yield call(editContractItem, payload);
      return Promise.resolve(res.success);
    },
    * removeContractItem({payload}, {call, put}) {
      const res = yield call(removeContractItem, payload);
      return Promise.resolve(res.success);
    },
    * takeProduct({payload}, {call, put}) {
      const res = yield call(takeProduct, payload);
      return Promise.resolve(res.success);
    },
    * removeTake({payload}, {call, put}) {
      const res = yield call(removeTake, payload);
      return Promise.resolve(res.success);
    },
    * editContractInfo({payload}, {call, put}) {
      const res = yield call(editContractInfo, payload);
      return Promise.resolve(res.success);
    },
    * payMoney({payload}, {call,}) {
      const res = yield call(payMoney, payload);
      return Promise.resolve(res.success);
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




import {createModel} from '../utils/rs/Model';
import {
  getUpcCompany,
  getUpcApply,
  getDepartmentApplyCount,
  changeDepartmentApplyCount,
  getUpcDepartmentSku,
  operateApply,
  getUpcMonthData,
  moveUpc
} from '../services/upc';


export default createModel({
  namespace: 'upc-company',
  initialState: {
    applyData: {
      list: [],
      total: 0,
    },
    applyPageIndex: 1,
    applyPageSize: 10,
    upcData: {
      list: [],
      total: 0,
    },
    departmentApplyCountList: [],
    departmentUpcSkuList: [],
    upcUseDataList:[],
  },
  effects: {
    * getUpcApply({payload}, {call, put}) {
      const res = yield call(getUpcApply, payload);
      if (res.data) {
        const applyData = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            applyData,
          },
        });
      }
    },
    * getUpcCompany({payload}, {call, put}) {
      const res = yield call(getUpcCompany, payload);
      if (res.data) {
        const upcData = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            upcData,
          },
        });
      }
    },
    * getDepartmentApplyCount({payload}, {call, put}) {
      const res = yield call(getDepartmentApplyCount, payload);
      if (res.data) {
        let {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            departmentApplyCountList: list,
          },
        });
      }
    },
    * getUpcMonthData({payload}, {call, put}) {
      const res = yield call(getUpcMonthData, payload);
      if (res.data) {
        let {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            upcUseDataList: list,
          },
        });
      }
    },
    * getUpcDepartmentSku({payload}, {call, put}) {
      const res = yield call(getUpcDepartmentSku, payload);
      if (res.data) {
        let {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            departmentUpcSkuList: list,
          },
        });
      }
    },
    * changeDepartmentApplyCount({payload}, {call,}) {
      const res = yield call(changeDepartmentApplyCount, payload);
      return Promise.resolve(res.success);
    },
    * operateApply({payload}, {call,}) {
      const res = yield call(operateApply, payload);
      return Promise.resolve(res.success);
    },
    * moveUpc({payload}, {call,}) {
      const res = yield call(moveUpc, payload);
      return Promise.resolve(res.success);
    },
  },
});





import {createModel} from '../utils/rs/Model';
import {
  get,
  userLeaveApply,
  cancelLeaveUser,
  editUserLeaveApply,
  getLeaveUserApplyByID,
  getEmployeeCount,
  confirmLeaveUser,
  reEntry,
} from "../services/employee";

export default createModel({
  namespace: 'employee-leave',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    leaveUserApply: {},
    employeeCountModel:{},
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(get, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
          },
        });
      }
      yield put({
        type:'getEmployeeCount',
      })
    },
    * getLeaveUserApplyByID({payload}, {call, put}) {
      const res = yield call(getLeaveUserApplyByID, payload);
      if (res.data) {
        const {record} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            leaveUserApply: record,
          },
        });
      }
    },
    * getEmployeeCount({payload}, {call, put}) {
      const res = yield call(getEmployeeCount, payload);
      if (res.data) {
        const {record} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            employeeCountModel: record,
          },
        });
      }
    },
    * userLeaveApply({payload}, {call, put}) {
      const res = yield call(userLeaveApply, payload);
      return Promise.resolve(res.success);
    },
    * editUserLeaveApply({payload}, {call, put}) {
      const res = yield call(editUserLeaveApply, payload);
      return Promise.resolve(res.success);
    },
    * cancelLeaveApply({payload}, {call, put}) {
      const res = yield call(cancelLeaveUser, payload);
      return Promise.resolve(res.success);
    },
    * confirmLeaveUser({payload}, {call, put}) {
      const res = yield call(confirmLeaveUser, payload);
      return Promise.resolve(res.success);
    },
    * reEntry({payload}, {call, put}) {
      const res = yield call(reEntry, payload);
      return Promise.resolve(res.success);
    },
  },
});




import {createModel} from '../utils/rs/Model';
import {getConfig} from '../services/assess-config';
import {
  getAssessUserList,
  getAssessDetail,
  startAssess,
  getNowAssess,
  cancelAssess,
  completeAssess,
  getEmployeeScoreList,
  updateManager,
  updateEmployee,
  update,
  updateMember,
  removeAssessEmployee,
  addAssessEmployee,
  backAssess,
} from '../services/assess';

export default createModel({
  namespace: 'assess-record',
  initialState: {
    config: [],
    nowAssess: {
      record: {},
      recordConfig: [],
      recordUser:null,
    },
    assessUserList: [],
    assessDetail: {
      managerList: [],
      employeeList: [],
    },
    currentEmployeeList: [],
  },
  effects: {
    * getConfig({payload}, {call, put}) {
      const res = yield call(getConfig, payload);
      if (res.data) {
        const {config} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            config,
          },
        });
      }
    },
    * getNowAssess({payload}, {call, put}) {
      const res = yield call(getNowAssess, payload);
      yield put({type: 'getConfig'});
      if (res.data) {
        const {record, recordConfig,recordUser} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            nowAssess: {
              record,
              recordConfig,
              recordUser,
            },
          },
        });
      }
    },
    * getAssessDetail({payload}, {call, put}) {
      const res = yield call(getAssessDetail, payload);
      if (res.data) {
        const {managerList, employeeList} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            assessDetail: {
              managerList,
              employeeList,
            }
          },
        });
      }
    },
    * getAssessUserList({payload}, {call, put}) {
      const res = yield call(getAssessUserList, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            assessUserList: list,
          },
        });
      }
    },
    * startAssess({payload}, {call, put}) {
      const res = yield call(startAssess, payload);
      return Promise.resolve({success: res.success});
    },
    * cancelAssess({payload}, {call, put}) {
      const res = yield call(cancelAssess, payload);
      return Promise.resolve({success: res.success});
    },
    * completeAssess({payload}, {call, put}) {
      const res = yield call(completeAssess, payload);
      return Promise.resolve({success: res.success});
    },
    * backAssess({payload}, {call, put}) {
      const res = yield call(backAssess, payload);
      return Promise.resolve({success: res.success});
    },
    * updateManager({payload}, {call, put}) {
      const res = yield call(updateManager, payload);
      return Promise.resolve({success: res.success});
    },
    * update({payload}, {call, put}) {
      const res = yield call(update, payload);
      return Promise.resolve({success: res.success});
    },
    * updateEmployee({payload}, {call, put}) {
      const res = yield call(updateEmployee, payload);
      return Promise.resolve({success: res.success});
    },
    * updateMember({payload}, {call, put}) {
      const res = yield call(updateMember, payload);
      return Promise.resolve(res.success);
    },
    * removeAssessEmployee({payload}, {call, put}) {
      const res = yield call(removeAssessEmployee, payload);
      return Promise.resolve(res.success);
    },
    * addAssessEmployee({payload}, {call, put}) {
      const res = yield call(addAssessEmployee, payload);
      const {userList}=res.data.toObject();
      return Promise.resolve({success:res.success,userList,});
    },
    * getEmployeeScoreList({payload}, {call, put}) {
      const res = yield call(getEmployeeScoreList, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            currentEmployeeList: list,
          },
        });
      }
    }
  },
});




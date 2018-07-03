import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {
  get, getCount, saveWorkPhoto,
  saveUserPosition, add, edit, remove
} from '../services/employee';
import {get as getDict} from '../services/dict';

export default createModel({
  namespace: 'employee',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    count: {
      all: 0,
      working: 0,
      trial: 0,
      temporary: 0,
      retire: 0,
      quit: 0,
    },
    filter: {
      jobNumber: undefined,
      empName: undefined,
      sex: undefined,
      workStatus: undefined,
      dateType: undefined,
      startDate: undefined,
      endDate: undefined,
      depID: undefined,
      userPosition:undefined,
    },
    filterKeys: null,
    sorter: {
      sorterColumn: 'jobNumber',
      sorterType: 'ascend',
    },
    selectItems: [],
    salaryList: [],
    workStatusList: [],
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
        yield put({type: 'getCount'});
      }
    },
    * getCount({payload}, {call, put}) {
      const res = yield call(getCount, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            count: {
              ...data,
            }
          },
        });
      }
    },
    * saveWorkPhoto({payload}, {call, put}) {
      const res = yield call(saveWorkPhoto, payload);
      return Promise.resolve(res.success);
    },
    * saveUserPosition({payload}, {call, put}) {
      const res = yield call(saveUserPosition, payload);
      if (res.success) {
        message.success("变更职位成功");
      } else {
        message.error("变更职位失败");
      }
      return Promise.resolve(res.success);
    },
    * add({payload}, {call, put}) {
      const res = yield call(add, payload);
      const {data} = res;
      const {userID} = data.toObject();
      return Promise.resolve({userID, success: res.success});
    },
    * edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve(res.success);
    },
    * remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },
    * getWorkStatus({payload}, {call, put}) {
      const res = yield call(getDict, {typeCode: 'job-status'});
      if (res) {
        const {data} = res;
        if (data) {
          const {model} = data;
          const _res = model.isEmpty() ? [] : model.toObject();
          yield put({
            type: 'setState',
            payload: {
              workStatusList: _res,
            }
          })
        }
      }
    }
  },

});




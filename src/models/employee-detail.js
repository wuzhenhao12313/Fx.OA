import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {getInfo} from '../services/employee';

export default createModel({
  namespace: 'employee-detail',
  initialState: {
    employee: {
      mobile: '',
      email: '',
      leaveDate: null,
      positionLevel: '',
      salarySubsidy: '',
      payday: '',
      jobNumber: '',
      name: '',
      workPhotoUrl: '',
      entryDate: null,
      correctionDate: null,
      depName: '',
      sex: '',
      birthday: null,
    },
    positionList: [],
    empContract: [],
    empInsurance: [],
    salary: null,
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(getInfo, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {employee, positionList, contractList, insuranceList, salary} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            employee,
            positionList,
            empContract: contractList,
            empInsurance: insuranceList,
            salary,
          },
        });
      }
    },
    *saveWorkPhoto({payload}, {call, put}) {
      const res = yield call(saveWorkPhoto, payload);
      return Promise.resolve(res.success);
    },
    *saveUserPosition({payload}, {call, put}) {
      const res = yield call(saveUserPosition, payload);
      if (res.success) {
        message.success("变更职位成功");
      } else {
        message.error("变更职位失败");
      }
      return Promise.resolve(res.success);
    },
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve(res.success);
    },
    *edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve(res.success);
    },
  },
});




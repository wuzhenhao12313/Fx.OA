import {createModel} from '../utils/rs/Model';
import {getEditInfoByNo, add, edit} from '../services/employee';

export default createModel({
  namespace: 'employee-edit',
  initialState: {
    employee: {
      jobNumber: '',
      depID: '',
      sex: '',
      workStatus: '',
      name: '',
      birthday: null,
      mobile: '',
      email: '',
      entryDate: null,
      correctionDate: null,
      leaveDate: null,
      payday: '',
      positionLevel: '',
      salarySubsidy: '',
      birthdayType: '',
      workPhotoUrl: '',
      recruitmentChannel: '',
      companyID: '',
      graduationSchool: '',
      graduationDate: null,
      major: '',
      foreignLanguages: null,
      computerLevel: '',
      hobby: '',
      specialty: '',
      maritalStatus: '',
      emergencyContact: '',
      emergencyContactPhone: '',
      originPlace: '',
      homeAddress: '',
      residentialAddress: '',
      ID: '',
      bankCard: '',
      openingBank: '',
      education: '',
    },
    positionList: [],
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(getEditInfoByNo, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {employee, positionList} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            employee,
            positionList,
          },
        });
      }
    },
    *add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve(res);
    },
    *edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve(res);
    },
  },
});




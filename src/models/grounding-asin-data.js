import {createModel} from '../utils/rs/Model';
import {
  getDepartmentDataCount,
  getGroundingAsinSaleRate,
  getAsinCategoryDataCount,
  getDepartmentAsinCategoryDataCount,
  getGroundingDepartment
} from '../services/grounding';

export default createModel({
  namespace: 'grounding-asin-data',
  initialState: {
    departmentAsinCountList: [],
    departmentSaleCountList: [],
    saleRateList:{
      list:[],
      total:0,
    },
    saleRatePageIndex:1,
    categoryDataCountList:[],
    departmentCategoryDataCountList:[],
    groundingDepartmentList:[],
  },
  effects: {
    * getDepartmentAsinCount({payload}, {call, put}) {
      const res = yield call(getDepartmentDataCount, {type:'asinCount',...payload});
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            departmentAsinCountList:list,
          },
        });
      }
    },
    * getGroundingAsinSaleRate({payload}, {call, put}) {
      const res = yield call(getGroundingAsinSaleRate, payload);
      if (res.data) {
        const saleRateList = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            saleRateList,
          },
        });
      }
    },
    * getDepartmentSaleCount({payload}, {call, put}) {
      const res = yield call(getDepartmentDataCount, {type:'saleCount',...payload});
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            departmentSaleCountList:list,
          },
        });
      }
    },
    * getAsinCategoryDataCount({payload}, {call, put}) {
      const res = yield call(getAsinCategoryDataCount, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            categoryDataCountList:list,
          },
        });
      }
    },
    * getDepartmentAsinCategoryDataCount({payload}, {call, put}) {
      const res = yield call(getDepartmentAsinCategoryDataCount, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            departmentCategoryDataCountList:list,
          },
        });
      }
    },
    * getGroundingDepartment({payload}, {call, put}) {
      const res = yield call(getGroundingDepartment, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            groundingDepartmentList:list,
          },
        });
      }
    },
  },
});




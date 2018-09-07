import {createModel} from '../utils/rs/Model';
import {getMyCyclePlan, addPlan, cancelPlan, getPlanDetail, editPlanItem, getPlanItemAsin,removePlanItem,addPlanItem} from '../services/grounding';
import {getUserList} from '../services/api';

export default createModel({
  namespace: 'grounding-plan',
  initialState: {
    data:{
      list:[],
      total:0,
    },
    userList:[],
    detailList:[],
    asinList:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      const res = yield call(getMyCyclePlan, payload);
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
    * getPlanDetail({payload}, {call, put}) {
      const res = yield call(getPlanDetail, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            detailList:list,
          },
        });
      }
    },
    * getPlanItemAsin({payload}, {call, put}) {
      const res = yield call(getPlanItemAsin, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            asinList:list,
          },
        });
      }
    },
    * getUserList({payload}, {call, put}) {
      const res = yield call(getUserList, payload);
      if (res.data) {
        let { list } = res.data.toObject();
        // list=list.filter(x=> x.isDepartmentManager!==1);
        list.forEach(x => { x.planCount = 0 });
        const notLeaveUser=list.filter(x=>x.isLeave===0);
        const leaveUser=list.filter(x=>x.isLeave===1);
        list =notLeaveUser.concat(leaveUser);
        yield put({
          type: 'setStateOk',
          payload: {
            userList:list,
          },
        });
      }
    },
    * addPlan({payload}, {call, put}) {
      const res = yield call(addPlan, payload);
      return Promise.resolve(res.success);
    },
    * cancelPlan({payload}, {call, put}) {
      const res = yield call(cancelPlan, payload);
      return Promise.resolve(res.success);
    },
    * editPlanItem({payload}, {call, put}) {
      const res = yield call(editPlanItem, payload);
      return Promise.resolve(res.success);
    },
    * removePlanItem({payload}, {call, put}) {
      const res = yield call(removePlanItem, payload);
      return Promise.resolve(res.success);
    },
    * addPlanItem({payload}, {call, put}) {
      const res = yield call(addPlanItem, payload);
      return Promise.resolve(res.success);
    },
  },
});




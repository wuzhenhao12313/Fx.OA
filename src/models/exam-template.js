import {createModel} from '../utils/rs/Model';
import {get, getRow, add, remove, edit} from '../services/exam-template';
import {getLevelCountCanAdd} from "../services/exam-question";

export default createModel({
  namespace: 'exam-template',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    item: {
      row: {},
      list: [],
    },
    sorter: {
      sorterColumn: 'createDate',
      sorterType: 'descend',
    },
    filter: {
      title: '',
      categoryCode: '',
    },
    filterKeys: null,
    levelCountList: [
      {
        level: 0.5,
        count: 0,
      },
      {
        level: 1.0,
        count: 0,
      },
      {
        level: 1.5,
        count: 0,
      },
      {
        level: 2.0,
        count: 0,
      },
      {
        level: 2.5,
        count: 0,
      },
      {
        level: 3.0,
        count: 0,
      },
      {
        level: 3.5,
        count: 0,
      },
      {
        level: 4.0,
        count: 0,
      },
      {
        level: 4.5,
        count: 0,
      },
      {
        level: 5.0,
        count: 0,
      },
    ],
    levelCountCanAddList: [],
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
    },
    * getRow({payload}, {call, put}) {
      const res = yield call(getRow, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {template} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            item: {
              row: template.item,
              list: template.itemList,
            },
          },
        });
      }
    },
    * getLevelCountCanAdd({payload}, {call, put}) {
      const res = yield call(getLevelCountCanAdd, payload);
      if (res.data) {
        const {list} = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            levelCountCanAddList: list,
          },
        });
      }
    },
    * add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve({success: res.success, data: res.data.toObject()});
    },
    * edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve({success: res.success, data: res.data.toObject()});
    },
    * remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },
  },
});





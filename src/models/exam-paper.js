import {message} from 'antd';
import {createModel} from '../utils/rs/Model';
import {get, addPaperByTemplate, edit, remove,getReviewItem} from '../services/exam-paper';
import {getAll} from '../services/exam-template';

export default createModel({
  namespace: 'exam-paper',
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
      title: null,
      categoryCode: null,
    },
    filterKeys: null,
    paperTemplateList: [],
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
    * getAllTemplateList({payload}, {call, put}) {
      const res = yield call(getAll, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            paperTemplateList: list,
          },
        });
      }
    },
    * getReviewItem({payload}, {call, put}) {
      const res = yield call(getReviewItem, payload);
      if (res.data) {
        const {paper} = res.data.toObject();
        const {item, itemList} = paper;
        yield put({
          type: 'setStateOk',
          payload: {
            item: {
              row: item,
              list: itemList,
            },
          },
        });
      }
    },
    * addPaperByTemplate({payload}, {call, put}) {
      const res = yield call(addPaperByTemplate, payload);
      const {record} = res.data.toObject();
      return Promise.resolve({success: res.success, record,})
    },
    * edit({payload}, {call,}) {
      const res = yield call(edit, payload);
      const {record} = res.data.toObject();
      return Promise.resolve({success: res.success, record,})
    },
    * remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },
  },
  reducers: {
  }
});





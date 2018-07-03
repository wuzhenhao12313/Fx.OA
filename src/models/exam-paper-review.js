import {createModel} from '../utils/rs/Model';
import {getReviewItem, editItem, editItemList,removePaperQuestion,addPaperQuestion} from '../services/exam-paper';
import {getLevelCountCanAdd} from '../services/exam-question';

export default createModel({
  namespace: 'exam-paper-review',
  initialState: {
    item: {
      row: {},
      list: [],
    },
    isEdit: false,
  },
  effects: {
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
    * edit({payload}, {call,put}) {
      const res = yield call(editItemList, payload);
      yield call(editItem, payload);
      const {totalScore} = res.data.toObject();
      return Promise.resolve({success: res.success, totalScore,});
    },
    *removePaperQuestion({payload}, {call,}) {
      const res = yield call(removePaperQuestion, payload);
      return Promise.resolve({success: res.success});
    },
    * add({payload}, {call,}) {
      const res = yield call(addPaperQuestion, payload);
      const {record} = res.data.toObject();
      return Promise.resolve({success: res.success, record,});
    },
  },
});





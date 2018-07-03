import {createModel} from '../utils/rs/Model';
import {get, add, edit, use, remove, editQuestionBasis,getTagList,createTag,removeTag} from '../services/exam-question';

export default createModel({
  namespace: 'exam-question-list',
  initialState: {
    data: {
      list: [],
      total: 0,
    },
    filter: {
      userName: undefined,
      questionType: undefined,
      title: undefined,
    },
    filterKeys: null,
    sorter: {
      sorterColumn: 'createDate',
      sorterType: 'descend',
    },
    questionCategory: '',
    tagList:[],
  },
  effects: {
    * get({payload}, {call, put}) {
      yield put({type: 'startLoading'});
      const res = yield call(get, payload);
      if (res.data) {
        const data = res.data.toObject();
        yield put({
          type: 'setStateOk',
          payload: {
            data,
            questionCategory: payload.questionCategory,
          },
        });
      }
      yield put({type: 'endLoading'});
    },
    * getTagList({payload}, {call, put}) {
        const res = yield call(getTagList, payload);
        if (res.data) {
          const { list } = res.data.toObject();
          yield put({
            type: 'setStateOk',
            payload: {
              tagList:list,
            },
          });
        }
    },
    * add({payload}, {call, put}) {
      const res = yield call(add, payload);
      return Promise.resolve({success: res.success, data: res.data});
    },
    * createTag({payload}, {call, put}) {
        const res = yield call(createTag, payload);
        return Promise.resolve(res.success);
    },
    * removeTag({payload}, {call, put}) {
      const res = yield call(removeTag, payload);
      return Promise.resolve(res.success);
  },
    * use({payload}, {call, put}) {
      const res = yield call(use, payload);
      return Promise.resolve(res.success);
    },
    * edit({payload}, {call, put}) {
      const res = yield call(edit, payload);
      return Promise.resolve({success: res.success, data: res.data});
    },
    * editQuestionBasis({payload}, {call, put}) {
      const res = yield call(editQuestionBasis, payload);
      return Promise.resolve(res.success);
    },
    * remove({payload}, {call, put}) {
      const res = yield call(remove, payload);
      return Promise.resolve(res.success);
    },

  },
});




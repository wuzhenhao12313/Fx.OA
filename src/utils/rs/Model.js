import {message} from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import {routerRedux} from 'dva/router';
import {validMenuAuth} from '../../services/config';

export function createModel({initialState, namespace, effects, subscriptions, reducers}) {
  return {
    namespace,
    state: {
      pageIndex: 1,
      pageSize: localStorage.getItem('pageSize') === null ? 10
        : parseInt(localStorage.getItem('pageSize')),
      loading: true,
      menuAuth: {
        hasAuth: false,
        actionList: [],
        columnList: [],
      },
      ...cloneDeep(initialState),
    },
    effects: {
      ...effects,
      *setState({payload}, {put}) {
        yield put({
          type: 'setStateOk',
          payload,
        });
      },
      *changeRoute({payload}, {put}) {
        yield put(routerRedux.push(payload.path));
      },
      *clear({payload}, {put}){
        yield put({
          type: 'clearOk',
        });
      },
      *resetState({payload}, {put}){
        yield put({
          type: 'resetPage',
        });
        yield put({
          type: 'resetStateOk',
        });
      },
      *resetPage({payload}, {put}){
        yield put({
          type: 'resetPageOk',
        });
      },
      *resetSearchValues({payload}, {put}){
        yield put({
          type: 'resetSearchValuesOk',
        });
      },
      *validMenuAuth({payload}, {call, put}){
        const res = yield call(validMenuAuth, payload);
        if (res.data) {
          const data = res.data.toObject();
          if (!data.hasAuth) {
            yield put(routerRedux.push('/exception/403'));
          }
          yield put({
            type: 'setStateOk',
            payload: {
              menuAuth: {
                ...data,
              }
            },
          });
        }
      },
      *addMsg({payload}, {put}){
        if (payload) {
          message.success('添加成功');
        } else {
          message.error('添加失败');
        }
      },
      *editMsg({payload}, {put}){
        if (payload) {
          message.success('编辑成功');
        } else {
          message.error('编辑失败');
        }
      },
      *deleteMsg({payload}, {put}){
        if (payload) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }
      },

    },
    subscriptions: {
      ...subscriptions,
    },
    reducers: {
      ...reducers,
      startLoading(state){
        return {
          ...state,
          loading: true,
        }
      },
      endLoading(state){
        return {
          ...state,
          loading: false,
        }
      },
      resetStateOk(state){
        return {
          ...state,
          pageIndex: 1,
          pageSize: localStorage.getItem('pageSize') === null ? 10
            : parseInt(localStorage.getItem('pageSize')),
          menuAuth: {
            hasAuth: false,
            actionList: [],
            columnList: [],
          },
          ... cloneDeep(initialState),
        };
      },
      resetSearchValuesOk(state){
        return {
          ...state,
          searchValues: cloneDeep(initialState)['searchValues'],
        }
      },
      setStateOk(state, {payload}) {
        return {
          ...state,
          ...payload,
        };
      },
      resetPageOk(state, {payload}){
        return {
          ...state,
          pageIndex: 1,
        };
      },
    },
  }
};

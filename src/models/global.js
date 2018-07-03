import {getUserMenu, validMenuAuth, getUserInfo, stayLogin, getNavList} from '../services/config';
import {signOut} from '../services/login';
import {routerRedux} from 'dva/router';
import {createNav} from '../utils/utils';
import Config from '../utils/rs/Config'

export default {
  namespace: 'global',
  state: {
    collapsed: false,
    stateCollapsed: false,
    userMenu: [],
    currentUser: {
      userID: 0,
      username: '',
    },
    stageNavList: [],
    currentStageCode: ''
  },

  effects: {
    *getUserMenu({payload}, {call, put}){
      const res = yield call(getUserMenu, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {list} = data;
        yield put({
          type: 'setUserMenuOk',
          payload: createNav(list),
        });
      }
    },

    *getUserInfo({payload}, {call, put}){
      const res = yield call(getUserInfo, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {user} = data;
        yield put({
          type: 'setUserInfoOk',
          payload: user,
        });
      }
    },
    *toUserCenter({payload}, {call, put}){
      if (window.location.hash !== '#/user-center') {
        yield put(routerRedux.push('/user-center'));
      }
    },
    *validMenuAuth({payload}, {call, put}){
      const res = yield call(validMenuAuth, payload);
      if (res.data) {
        const data = res.data.toObject();
        if (!data.hasAuth) {
          yield put(routerRedux.push('/exception/403'));
        }
        yield put({
          type: 'setMenuAuthOk',
          payload: data,
        });
      }
    },
    *stayLogin({payload}, {call, put}){
      const res = yield call(stayLogin, payload);
    },
    *getUserNavList({payload}, {call, put}){
      const res = yield call(getNavList, payload);
      if (res.data) {
        const data = res.data.toObject();
        const {navList} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            stageNavList: navList,
            currentStageCode: payload.menuCode,
          }
        })
      }
    },
    *signOut({payload}, {call, put}){
      const res = yield call(signOut, payload);
      if (res) {
        const from = window.location.href;
        window.location.href = `${Config.GetConfig("loginServer")}?app=${Config.appCode}&from=${from}`;
      }
    },
    *setState({payload}, {call, put}){
      yield put({
        type: 'setStateOk',
        payload,
      })
    }
  },

  reducers: {
    changeLayoutCollapsed(state, {payload}) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    changeStageCollapsed(state, {payload}) {
      return {
        ...state,
        stageCollapsed: payload,
      };
    },
    setUserMenuOk(state, {payload}){
      return {
        ...state,
        userMenu: payload,
      };
    },
    setMenuAuthOk(state, {payload}){
      return {
        ...state,
        menuAuth: payload,
      };
    },
    setStateOk(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    setUserInfoOk(state, {payload}){
      return {
        ...state,
        currentUser: payload,
      };
    }
  },

  subscriptions: {
    setup({history}) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({pathname, search}) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};

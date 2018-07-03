import {createModel} from '../utils/rs/Model';
import {getUserInfoAll,saveUserCustomInfo} from '../services/config';
import {String} from '../utils/rs/Util';
import Config from '../utils/rs/Config'

export default createModel({
  namespace: 'user-center',
  initialState: {
    userInfo: {},
    currentImageUrl: "",
  },
  effects: {
    *get({payload}, {call, put}) {
      const res = yield call(getUserInfoAll);
      if (res.data) {
        const data = res.data.toObject();
        const {userInfo} = data;
        yield put({
          type: 'setStateOk',
          payload: {
            userInfo,
            currentImageUrl: !String.IsNullOrEmpty(userInfo.headImage) ? `${userInfo.headImage}` : Config.defaultAvator,
          },
        });
      }
    },
    *save({payload}, {call, put}) {
      const res = yield call(saveUserCustomInfo, payload);
      return Promise.resolve(res.success);
    },
  },
});



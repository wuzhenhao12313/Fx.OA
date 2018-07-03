import axios from 'axios';
import {message} from 'antd';
import LoadingService from '../rs/LoadingService';
import Config from '../rs/Config';
import {String} from '../rs/Util';

const config = {
  timeout: 120000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

const ajax = axios.create(config);
const ajaxApi = axios.create(config);

ajax.interceptors.response.use((res) => {
  if (res.status === 202) {
    setTimeout(() => {
      LoadingService.Done();
      window.location.href = `${Config.GetConfig('loginServer')}?app=OA&from=${Config.GetConfig('url')}#/dashboard/workplace`;
    }, 0);
    return false;
  } else {
    if (!res.data.success) {
      if (res.data.errCode === '403') {
        message.warning(res.data.msg);
      } else {
        if (!String.IsNullOrEmpty(res.data.msg)) {
          message.error(res.data.msg);
        }
      }
      LoadingService.Done();
      return Promise.resolve(false);
    } else {
      if (res.data.msg&&res.data.msg !== '') {
        message.success(res.data.msg);
      }
      return Promise.resolve(res.data);
    }
  }
}, (err) => {
  setTimeout(() => {
    LoadingService.Done();
    message.error('服务器错误');
  }, 0);
});

const Http = {};

Http.AutoError = {
  Post(url, params) {
    return ajax.post(url, params);
  },
  Put(url, params) {
    return ajax.put(url, params);
  },
  Delete(url, params) {
    return ajax.delete(url, params);
  },
  Get(url, params) {
    if (params === undefined) {
      return ajax.get(url, {});
    }
    return ajax.get(url, {params});
  },
}

Http.Base = {
  Post(url, params) {
    return ajaxApi.post(url, params);
  },
  Put(url, params) {
    return ajaxApi.put(url, params);
  },
  Delete(url, params) {
    return ajaxApi.delete(url, params);
  },
  Get(url, params) {
    if (params === undefined) {
      return ajaxApi.get(url, {});
    }
    return ajaxApi.get(url, {params});
  },
}


export default Http;

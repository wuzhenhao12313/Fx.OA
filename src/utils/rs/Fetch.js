import Http from '../../utils/rs/Http';
import Config from '../../utils/rs/Config';
import jQuery from 'jquery';

export function fetchApi({url, params}) {
  return new Promise((resolve, reject) => {
    Http.Base.Get(Config.GetConfig('fxApi') + url, params).then(res => {
      const {data} = res;
      if (data) {
        resolve(data);
      }
    });
  });
}


export function fetchService({url, params}) {
  return new Promise((resolve, reject) => {
    Http.AutoError.Get(Config.GetConfig('fxService') + url, params).then(res => {
      const {data} = res;
      if (data) {
        resolve(data.toObject());
      }
    });
  });
}

export function fetchProdService({url, params}) {
  return new Promise((resolve, reject) => {
    Http.AutoError.Get(Config.prod.fxService + url, params).then(res => {
      const {data} = res;
      if (data) {
        resolve(data.toObject());
      }
    });
  });
}

export function postService({url, params}) {
  return new Promise((resolve, reject) => {
    Http.AutoError.Post(Config.GetConfig('fxService') + url, params).then(res => {
      const {data} = res;
      if (data) {
        resolve(data);
      }
    });
  });
}

export function fetchDict({typeCode}) {
  return new Promise((resolve, reject) => {
    Http.Base.Get(Config.prod.fxService + '/api/dict/item/get', {typeCode}).then(res => {
      const {data} = res;
      if (data) {
        const {model} = data;
        const res = model.isEmpty() ? [] : model.toObject();
        resolve(res);
      }
    });
  });
}

export function fetchApiSync({url, params}) {
  let res = null;
  try {
    jQuery.ajax({
      type: 'get',
      url: Config.GetConfig('fxApi') + url,
      data: {
        ...params,
      },
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      async: false,
      success: function (result) {
        res=result;
      }
    });
  } catch (ex) {
    console.log(ex);
    return res;
  }
  return res;
}

export function fetchDictSync({typeCode, itemCode}) {
  let res = null;
  try {
    jQuery.ajax({
      type: 'get',
      url: Config.prod.fxService + '/api/dict/item/get',
      data: {
        typeCode,
        itemCode,
      },
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      async: false,
      success: function (result) {
        const {model} = result;
        res = model.toObject();
      }
    });
  } catch (ex) {
    console.log(ex);
    return res;
  }
  return res;
}









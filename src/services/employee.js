import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Hr/Employee`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getCount(params) {
  return Http.AutoError.Get(`${prefix}/GetCount`, params);
}

export async function getInfo(params) {
  return Http.AutoError.Get(`${prefix}/GetInfo`, params);
}

export async function getInfoByNo(params) {
  return Http.AutoError.Get(`${prefix}/GetInfoByNo`, params);
}

export async function getEditInfoByNo(params) {
  return Http.AutoError.Get(`${prefix}/GetEditInfoByNo`, params);
}

export async function saveInfo(params) {
  return Http.AutoError.Post(`${prefix}/SaveInfo`, params);
}

export async function saveWorkPhoto(params){
  return Http.AutoError.Post(`${prefix}/SaveWorkPhoto`, params);
}

export async function saveUserPosition(params){
  return Http.AutoError.Post(`${prefix}/SaveUserPosition`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function edit(params) {
  console.log(params)
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}




import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/User/Config`;

export async function getUserInfo(params) {
  return Http.AutoError.Get(`${prefix}/GetUserInfo`, params);
}

export async function getUserInfoAll(params) {
  return Http.AutoError.Get(`${prefix}/GetUserCustomInfo`, params);
}

export async function saveUserCustomInfo(params) {
  return Http.AutoError.Post(`${prefix}/SaveUserCustomInfo`, params);
}

export async function stayLogin(params) {
  return Http.AutoError.Get(`${prefix}/StayLogin`, params);
}

export async function getUserMenu(params) {
  return Http.AutoError.Get(`${Config.prod.fxService}/User/Config/GetUserMenu`, params);
}

export async function getNavList(params) {
  return Http.AutoError.Get(`${Config.prod.fxService}/User/Config/GetUserNavList`, params);
}

export async function validMenuAuth(params) {
  return Http.AutoError.Get(`${Config.prod.fxService}/User/Config/ValidMenuAuth`, params);
}


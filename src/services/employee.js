import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Hr/Employee`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getCount(params) {
  return Http.AutoError.Get(`${prefix}/GetCount`, params);
}

export async function getEmployeeCount(params) {
  return Http.AutoError.Get(`${prefix}/GetEmployeeCount`, params);
}

export async function getInfo(params) {
  return Http.AutoError.Get(`${prefix}/GetInfo`, params);
}

export async function getLeaveUserApplyByID(params) {
  return Http.AutoError.Get(`${prefix}/GetLeaveUserApplyByID`, params);
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
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function editProbationDate(params) {
  return Http.AutoError.Post(`${prefix}/EditProbationDate`, params);
}

export async function probationUser(params) {
  return Http.AutoError.Post(`${prefix}/probationUser`, params);
}

export async function userLeaveApply(params) {
  return Http.AutoError.Post(`${prefix}/UserLeaveApply`, params);
}

export async function editUserLeaveApply(params) {
  return Http.AutoError.Post(`${prefix}/editUserLeaveApply`, params);
}

export async function cancelLeaveUser(params) {
  return Http.AutoError.Post(`${prefix}/CancelLeaveUser`, params);
}

export async function confirmLeaveUser(params) {
  return Http.AutoError.Post(`${prefix}/ConfirmLeaveUser`, params);
}

export async function reEntry(params) {
  return Http.AutoError.Post(`${prefix}/ReEntry`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}




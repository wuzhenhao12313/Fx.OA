import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Erp/Materiel`;

export async function getMyApply(params) {
  return Http.AutoError.Get(`${prefix}/GetMyApply`, params);
}

export async function getApply(params) {
  return Http.AutoError.Get(`${prefix}/GetApply`, params);
}

export async function getCategory(params) {
  return Http.AutoError.Get(`${prefix}/GetCategory`, params);
}

export async function getCountByID(params) {
  return Http.AutoError.Get(`${prefix}/GetCountByID`, params);
}

export async function getInOutLog(params) {
  return Http.AutoError.Get(`${prefix}/GetInOutLog`, params);
}

export async function getMaterielCount(params) {
  return Http.AutoError.Get(`${prefix}/GetMaterielCount`, params);
}

export async function getMaterielDataCount(params) {
  return Http.AutoError.Get(`${prefix}/GetMaterielDataCount`, params);
}

export async function applyMateriel(params) {
  return Http.AutoError.Post(`${prefix}/ApplyMateriel`, params);
}

export async function cancelApply(params) {
  return Http.AutoError.Post(`${prefix}/CancelApply`, params);
}

export async function auditApply(params) {
  return Http.AutoError.Post(`${prefix}/AuditApply`, params);
}

export async function createCategory(params) {
  return Http.AutoError.Post(`${prefix}/CreateCategory`, params);
}

export async function editCategory(params) {
  return Http.AutoError.Post(`${prefix}/EditCategory`, params);
}

export async function removeCategory(params) {
  return Http.AutoError.Post(`${prefix}/RemoveCategory`, params);
}

export async function addMaterielIns(params) {
  return Http.AutoError.Post(`${prefix}/AddMaterielIns`, params);
}



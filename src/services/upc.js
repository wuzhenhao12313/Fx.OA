import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Erp/Shop/Upc`;


export async function getUpcCompany(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcCompany`, params);
}

export async function getUpcDepartment(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcDepartment`, params);
}

export async function getUpcShop(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcShop`, params);
}

export async function getUpcApply(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcApply`, params);
}

export async function getUpcDepartmentSku(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcDepartmentSku`, params);
}

export async function getDepartmentApplyCount(params) {
  return Http.AutoError.Get(`${prefix}/GetDepartmentApplyCount`, params);
}

export async function getUpcMonthData(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcMonthData`, params);
}

export async function getUpcRole(params) {
  return Http.AutoError.Get(`${prefix}/GetUpcRole`, params);
}

export async function changeDepartmentApplyCount(params) {
  return Http.AutoError.Post(`${prefix}/ChangeDepartmentApplyCount`, params);
}

export async function applyUpc(params) {
  return Http.AutoError.Post(`${prefix}/ApplyUpc`, params);
}

export async function cancelApply(params) {
  return Http.AutoError.Post(`${prefix}/CancelApply`, params);
}

export async function operateApply(params) {
  return Http.AutoError.Post(`${prefix}/OperateApply`, params);
}

export async function allotUpc(params) {
  return Http.AutoError.Post(`${prefix}/AllotUpc`, params);
}

export async function useUpc(params) {
  return Http.AutoError.Post(`${prefix}/UseUpc`, params);
}

export async function moveUpc(params) {
  return Http.AutoError.Post(`${prefix}/MoveUpc`, params);
}

export async function returnUpc(params) {
  return Http.AutoError.Post(`${prefix}/ReturnUpc`, params);
}



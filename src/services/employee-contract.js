import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Hr/EmployeeContract`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getCount(params) {
  return Http.AutoError.Get(`${prefix}/GetCount`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Delete`, params);
}

export async function stop(params) {
  return Http.AutoError.Post(`${prefix}/Stop`, params);
}

export async function cancelStop(params) {
  return Http.AutoError.Post(`${prefix}/CancelStop`, params);
}

export async function updateStopDate(params) {
  return Http.AutoError.Post(`${prefix}/UpdateStopDate`, params);
}

export async function saveRemark(params) {
  return Http.AutoError.Post(`${prefix}/SaveContractRemark`, params);
}

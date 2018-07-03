import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/PositionLevel`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getLevelSalary(params) {
  return Http.AutoError.Get(`${prefix}/GetLevelSalary`, params);
}

export async function saveLevelSalary(params) {
  return Http.AutoError.Post(`${prefix}/SaveLevelSalary`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}

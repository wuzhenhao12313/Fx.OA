import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Dashboard`;

export async function getWorkPlaceConfig(params) {
  return Http.AutoError.Get(`${prefix}/WorkPlace/Config`, params);
}

export async function getWorkFlow(params) {
  return Http.AutoError.Get(`${prefix}/WorkPlace/WorkFlow`, params);
}


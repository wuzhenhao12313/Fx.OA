import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Assess/Config`;

export async function getConfig(params) {
  return Http.AutoError.Get(`${prefix}/GetConfig`, params);
}

export async function getUserConfig(params) {
  return Http.AutoError.Get(`${prefix}/GetUserConfig`, params);
}

export async function getConfigByUserID(params) {
  return Http.AutoError.Get(`${prefix}/getConfigByUserID`, params);
}

export async function setConfig(params) {
  return Http.AutoError.Post(`${prefix}/SetConfig`, params)
}



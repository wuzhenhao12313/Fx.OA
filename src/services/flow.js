import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Flow`;

export async function getLog(params) {
  return Http.AutoError.Get(`${prefix}/Log/Get`, params);
}

export async function audit(params) {
  return Http.AutoError.Post(`${prefix}/Audit`, params);
}

import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/InternalAddress`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

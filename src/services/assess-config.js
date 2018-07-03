import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Assess/Config`;

export async function getConfig(params) {
  return Http.AutoError.Get(`${prefix}/GetConfig`, params);
}

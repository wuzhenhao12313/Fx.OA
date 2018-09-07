import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Hr/UnusualActionLog`;

export async function getPage(params) {
  return Http.AutoError.Get(`${prefix}/GetPage`, params);
}

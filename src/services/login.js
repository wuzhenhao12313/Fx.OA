import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/User/Login`;

export async function signOut(params) {
  return Http.AutoError.Post(`${prefix}/SignOut`, params);
}

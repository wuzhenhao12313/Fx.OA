import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = Config.GetConfig('fxApi');

export async function getUserList(params) {
  return Http.AutoError.Get(prefix+"/User/GetUserList",params);
}





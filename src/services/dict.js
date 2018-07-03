import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.prod.fxApi}/Dict`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Item/Get`,params);
}

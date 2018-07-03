import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/AM/Department`;

export async function get() {
  return Http.AutoError.Get(`${prefix}/Get`);
}

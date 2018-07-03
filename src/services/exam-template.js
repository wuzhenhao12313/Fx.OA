import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Exam/Template`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getAll(params) {
  return Http.AutoError.Get(`${prefix}/GetAll`, params);
}

export async function getRow(params) {
  return Http.AutoError.Get(`${prefix}/GetItem`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function use(params) {
  return Http.AutoError.Post(`${prefix}/Use`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}

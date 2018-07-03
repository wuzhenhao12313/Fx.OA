import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Exam/Pc`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function audit(params) {
  return Http.AutoError.Post(`${prefix}/AuditTmp`, params);
}

export async function use(params) {
  return Http.AutoError.Post(`${prefix}/Use`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}

export async function getStartPaper(params) {
  return Http.AutoError.Get(`${prefix}/GetStartPaper`, params);
}

export async function updateQuestionInsList(params) {
  return Http.AutoError.Post(`${prefix}/UpdateQuestionInsList`, params);
}

export async function submit(params) {
  return Http.AutoError.Post(`${prefix}/Submit`, params);
}

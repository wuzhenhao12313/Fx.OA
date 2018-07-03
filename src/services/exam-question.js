import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Exam/Question`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getCount(params) {
  return Http.AutoError.Get(`${prefix}/GetCount`, params);
}

export async function getTagList(params) {
  return Http.AutoError.Get(`${prefix}/GetTagList`, params);
}

export async function getLevelCountCanAdd(params) {
  return Http.AutoError.Get(`${prefix}/GetLevelCountCanAdd`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function use(params) {
  return Http.AutoError.Post(`${prefix}/Use`, params);
}

export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function editQuestionBasis(params) {
  return Http.AutoError.Post(`${prefix}/EditQuestionBasis`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}

export async function createTag(params) {
  return Http.AutoError.Post(`${prefix}/CreateTag`, params);
}

export async function removeTag(params) {
  return Http.AutoError.Post(`${prefix}/RemoveTag`, params);
}



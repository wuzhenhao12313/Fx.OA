import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Exam/Record`;

export async function getBatchItem(params) {
  return Http.AutoError.Get(`${prefix}/GetBatchItem`, params);
}

export async function add(params) {
  return Http.AutoError.Post(`${prefix}/Add`, params);
}

export async function submitBatch(params) {
  return Http.AutoError.Post(`${prefix}/SubmitBatch`, params);
}

export async function updateBatchQuestionList(params) {
  return Http.AutoError.Post(`${prefix}/UpdateBatchQuestionList`, params);
}

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getScoreReport(params) {
  return Http.AutoError.Get(`${prefix}/GetScoreReport`, params);
}

export async function getEffect(params) {
  return Http.AutoError.Get(`${prefix}/GetEffect`, params);
}

export async function getPaperList(params) {
  return Http.AutoError.Get(`${prefix}/GetPaperList`, params);
}

export async function createExam(params) {
  return Http.AutoError.Post(`${prefix}/createExam`, params);
}

export async function getReviewItem(params) {
  return Http.AutoError.Get(`${prefix}/GetReviewItem`, params);
}

export async function remove(params) {
  return Http.AutoError.Post(`${prefix}/Remove`, params);
}


export async function edit(params) {
  return Http.AutoError.Post(`${prefix}/Edit`, params);
}

export async function use(params) {
  return Http.AutoError.Post(`${prefix}/Use`, params);
}


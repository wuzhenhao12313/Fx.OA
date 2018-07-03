import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Exam/Paper`;

export async function get(params) {
  return Http.AutoError.Get(`${prefix}/Get`, params);
}

export async function getReviewItem(params) {
  return Http.AutoError.Get(`${prefix}/GetReviewItem`, params);
}


export async function editItem(params) {
  return Http.AutoError.Post(`${prefix}/EditPaper`, params);
}

export async function editItemList(params) {
  return Http.AutoError.Post(`${prefix}/EditItemList`, params);
}

export async function addPaperByTemplate(params) {
  return Http.AutoError.Post(`${prefix}/AddPaperByTemplate`, params);
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

export async function removePaperQuestion(params) {
  return Http.AutoError.Post(`${prefix}/RemovePaperQuestion`, params);
}

export async function addPaperQuestion(params) {
  return Http.AutoError.Post(`${prefix}/AddPaperQuestion`, params);
}


import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/OA/Assess`;

export async function getNowAssess(params) {
  return Http.AutoError.Get(`${prefix}/GetNowAssess`, params);
}

export async function getMyAssess(params) {
  return Http.AutoError.Get(`${prefix}/GetMyAssess`, params);
}

export async function getAssessUserList(params) {
  return Http.AutoError.Get(`${prefix}/GetAssessUserList`, params);
}

export async function getAssessDetail(params) {
  return Http.AutoError.Get(`${prefix}/GetAssessDetail`, params);
}

export async function startAssess(params) {
  return Http.AutoError.Post(`${prefix}/StartAssess`, params);
}

export async function cancelAssess(params) {
  return Http.AutoError.Post(`${prefix}/CancelAssess`, params);
}

export async function completeAssess(params) {
  return Http.AutoError.Post(`${prefix}/CompleteAssess`, params);
}

export async function update(params) {
  return Http.AutoError.Post(`${prefix}/Update`, params);
}

export async function updateMember(params) {
  return Http.AutoError.Post(`${prefix}/UpdateMember`, params);
}

export async function updateManager(params) {
  return Http.AutoError.Post(`${prefix}/UpdateManager`, params);
}

export async function updateEmployee(params) {
  return Http.AutoError.Post(`${prefix}/UpdateEmployee`, params);
}

export async function removeAssessEmployee(params) {
  return Http.AutoError.Post(`${prefix}/RemoveAssessEmployee`, params);
}

export async function addAssessEmployee(params) {
  return Http.AutoError.Post(`${prefix}/AddAssessEmployee`, params);
}

export async function getEmployeeScoreList(params) {
  return Http.AutoError.Get(`${prefix}/GetEmployeeScoreList`, params);
}

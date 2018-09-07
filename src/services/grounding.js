import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Erp/Grounding`;

export async function getCyclePlan(params) {
  return Http.AutoError.Get(`${prefix}/GetCyclePlan`, params);
}

export async function getMyCyclePlan(params) {
  return Http.AutoError.Get(`${prefix}/GetMyCyclePlan`, params);
}

export async function getPlanDetail(params) {
  return Http.AutoError.Get(`${prefix}/GetPlanDetail`, params);
}

export async function getMyPlanDetail(params) {
  return Http.AutoError.Get(`${prefix}/GetMyPlanDetail`, params);
}

export async function getCurrentTask(params) {
  return Http.AutoError.Get(`${prefix}/GetCurrentTask`, params);
}

export async function getPlanItemAsin(params) {
  return Http.AutoError.Get(`${prefix}/GetPlanItemAsin`, params);
}

export async function getDepartmentDataCount(params) {
  return Http.AutoError.Get(`${prefix}/GetDepartmentDataCount`, params);
}

export async function addAsin(params) {
  return Http.AutoError.Post(`${prefix}/AddAsin`, params);
}

export async function editAsin(params) {
  return Http.AutoError.Post(`${prefix}/EditAsin`, params);
}

export async function moveAsin(params) {
  return Http.AutoError.Post(`${prefix}/MoveAsin`, params);
}

export async function removeAsin(params) {
  return Http.AutoError.Post(`${prefix}/RemoveAsin`, params);
}

export async function addPlan(params) {
  return Http.AutoError.Post(`${prefix}/AddPlan`, params);
}

export async function cancelPlan(params) {
  return Http.AutoError.Post(`${prefix}/CancelPlan`, params);
}

export async function switchPlan(params) {
  return Http.AutoError.Post(`${prefix}/SwitchPlan`, params);
}

export async function switchUnder(params) {
    return Http.AutoError.Post(`${prefix}/SwitchUnder`, params);
}

export async function addPlanItem(params) {
  return Http.AutoError.Post(`${prefix}/AddPlanItem`, params);
}

export async function editPlanItem(params) {
  return Http.AutoError.Post(`${prefix}/EditPlanItem`, params);
}

export async function removePlanItem(params) {
  return Http.AutoError.Post(`${prefix}/RemovePlanItem`, params);
}

export async function  runDownloading(params) {
  return Http.AutoError.Post(`${prefix}/RunDownloading`, params);
}

export async function  refreshAsinByID(params) {
  return Http.AutoError.Post(`${prefix}/RefreshAsinByID`, params);
}

export async function  getAsinList(params) {
  return Http.AutoError.Get(`${prefix}/GetAsinList`, params);
}

export async function  getPAsinDetail(params) {
  return Http.AutoError.Get(`${prefix}/GetPAsinDetail`, params);
}
export async function  getNotDownloadAsinList(params) {
  return Http.AutoError.Get(`${prefix}/GetNotDownloadAsinList`, params);
}

export  async function getGroundingAsinSaleRate(params) {
  return Http.AutoError.Get(`${prefix}/GetAsinSaleRate`, params);
}

export  async function getAsinCategoryDataCount(params) {
  return Http.AutoError.Get(`${prefix}/GetAsinCategoryDataCount`, params);
}

export  async function getDepartmentAsinCategoryDataCount(params) {
  return Http.AutoError.Get(`${prefix}/GetDepartmentAsinCategoryDataCount`, params);
}

export  async function getGroundingDepartment(params) {
  return Http.AutoError.Get(`${prefix}/GetGroundingDepartment`, params);
}

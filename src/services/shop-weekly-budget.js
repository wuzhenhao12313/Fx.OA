import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Erp/Shop/WeeklyBudget`;

export async function getMyRecord(params) {
  return Http.AutoError.Get(`${prefix}/GetMyRecord`, params);
}

export async function getReport(params) {
  return Http.AutoError.Get(`${prefix}/GetReport`, params);
}

export async function apply(params) {
  return Http.AutoError.Post(`${prefix}/Apply`, params);
}

export async function cancel(params) {
  return Http.AutoError.Post(`${prefix}/Cancel`, params);
}

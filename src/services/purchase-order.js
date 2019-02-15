import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Erp/Product/PurchaseOrder`;

export async function getList(params) {
  return Http.AutoError.Get(`${prefix}/GetList`, params);
}

export async function getInstockList(params) {
  return Http.AutoError.Get(`${prefix}/GetInstockList`, params);
}


export async function getPurchaseItemListByID(params) {
  return Http.AutoError.Get(`${prefix}/GetPurchaseItemListByID`, params);
}

export async function getBulkItemListByID(params) {
  return Http.AutoError.Get(`${prefix}/GetBulkItemListByID`, params);
}

export async function getIsPayPurchaseItem(params) {
  return Http.AutoError.Get(`${prefix}/GetIsPayPurchaseItem`, params);
}

export async function getIsPayBulkItem(params) {
  return Http.AutoError.Get(`${prefix}/GetIsPayBulkItem`, params);
}

export async function getBulkInstockItem(params) {
  return Http.AutoError.Get(`${prefix}/GetBulkInstockItem`, params);
}

export async function getPurchaseInstockItem(params) {
  return Http.AutoError.Get(`${prefix}/GetPurchaseInstockItem`, params);
}

export async function submitPay(params) {
  return Http.AutoError.Post(`${prefix}/SubmitPay`, params);
}

export async function submitInstock(params) {
  return Http.AutoError.Post(`${prefix}/SubmitInstock`, params);
}

export async function createInstockOrder(params) {
  return Http.AutoError.Post(`${prefix}/CreateInstockOrder`, params);
}




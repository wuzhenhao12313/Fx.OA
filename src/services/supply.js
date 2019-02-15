import Http from '../utils/rs/Http';
import Config from '../utils/rs/Config';

const prefix = `${Config.GetConfig('fxService')}/Erp/Supply/Product/Purchase`;

export async function getProductPurchaseContractList(params) {
  return Http.AutoError.Get(`${prefix}/GetProductPurchaseContractList`, params);
}

export async function getContractDetailByIDInCreate(params) {
  return Http.AutoError.Get(`${prefix}/GetContractDetailByIDInCreate`, params);
}

export async function getContractDetailByID(params) {
  return Http.AutoError.Get(`${prefix}/GetContractDetailByID`, params);
}

export async function getTakeProductBatchByItemID(params) {
  return Http.AutoError.Get(`${prefix}/GetTakeProductBatchByItemID`, params);
}

export async function getNeedPayProductTake(params) {
  return Http.AutoError.Get(`${prefix}/GetNeedPayProductTake`, params);
}

export async function getPayByTakeID(params) {
  return Http.AutoError.Get(`${prefix}/GetPayByTakeID`, params);
}

export async function getContractAdanvePay(params) {
  return Http.AutoError.Get(`${prefix}/GetContractAdanvePay`, params);
}

export async function getNoPayCount(params) {
  return Http.AutoError.Get(`${prefix}/GetNoPayCount`, params);
}

export async function getPayRecord(params) {
  return Http.AutoError.Get(`${prefix}/GetPayRecord`, params);
}

export async function getPayRecordByContractID(params) {
  return Http.AutoError.Get(`${prefix}/GetPayRecordByContractID`, params);
}

export async function getSupplierList(params) {
  return Http.AutoError.Get(`${prefix}/GetSupplierList`, params);
}

export async function getAllSupplier(params) {
  return Http.AutoError.Get(`${prefix}/GetAllSupplier`, params);
}

export async function addContract(params) {
  return Http.AutoError.Post(`${prefix}/AddContract`, params);
}

export async function submitContract(params) {
  return Http.AutoError.Post(`${prefix}/SubmitContract`, params);
}

export async function editContract(params) {
  return Http.AutoError.Post(`${prefix}/EditContract`, params);
}

export async function removeContract(params) {
  return Http.AutoError.Post(`${prefix}/RemoveContract`, params);
}

export async function addContractCondition(params) {
  return Http.AutoError.Post(`${prefix}/AddContractCondition`, params);
}

export async function editContractCondition(params) {
  return Http.AutoError.Post(`${prefix}/EditContractCondition`, params);
}

export async function removeContractCondition(params) {
  return Http.AutoError.Post(`${prefix}/RemoveContractCondition`, params);
}

export async function addContractItem(params) {
  return Http.AutoError.Post(`${prefix}/AddContractItem`, params);
}

export async function editContractItem(params) {
  return Http.AutoError.Post(`${prefix}/EditContractItem`, params);
}

export async function removeContractItem(params) {
  return Http.AutoError.Post(`${prefix}/RemoveContractItem`, params);
}

export async function takeProduct(params) {
  return Http.AutoError.Post(`${prefix}/TakeProduct`, params);
}

export async function payMoney(params) {
  return Http.AutoError.Post(`${prefix}/PayMoney`, params);
}

export async function editPay(params) {
  return Http.AutoError.Post(`${prefix}/EditPay`, params);
}

export async function removeTake(params) {
  return Http.AutoError.Post(`${prefix}/RemoveTake`, params);
}

export async function addSupplier(params) {
  return Http.AutoError.Post(`${prefix}/AddSupplier`, params);
}

export async function editSupplier(params) {
  return Http.AutoError.Post(`${prefix}/EditSupplier`, params);
}

export async function removeSupplier(params) {
  return Http.AutoError.Post(`${prefix}/RemoveSupplier`, params);
}

export async function removePay(params) {
  return Http.AutoError.Post(`${prefix}/RemovePay`, params);
}

export async function editContractInfo(params) {
  return Http.AutoError.Post(`${prefix}/EditContractInfo`, params);
}

export  async function getTakeReport(params) {
  return Http.AutoError.Get(`${prefix}/GetTakeReport`, params);
}







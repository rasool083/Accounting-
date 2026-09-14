'use strict';
const UI_CONTRACT={
 modalClass:'ac-modal', centered:true,
 modalPages:['capital','expenses','inventory','payments','people','prices','production','products','purchases','receipts','sales','warehouses'],
 saleBaseQuantity:(q,u,base,pack,upp)=>Number(q||0)*(u===pack?Number(upp||1):1),
 checkFields:['status','destination','returned'],
 checkStatuses:['نزد ما','تودیع‌شده','وصول شده','برگشتی','باطل'],
 warehouseActions:['edit','delete','active'],
 tierActions:['edit','active']
};
module.exports={UI_CONTRACT};

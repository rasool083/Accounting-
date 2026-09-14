'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {UI_CONTRACT}=require('../ui-phase05-contract.js');

test('all data-entry dialogs are centered and use one modal system',()=>{
  assert.equal(UI_CONTRACT.modalClass,'ac-modal');
  assert.equal(UI_CONTRACT.centered,true);
  assert.deepEqual(UI_CONTRACT.modalPages.sort(),['capital','expenses','inventory','payments','people','prices','production','products','purchases','receipts','sales','warehouses']);
});

test('sales unit conversion uses package quantity for carton pricing',()=>{
  assert.equal(UI_CONTRACT.saleBaseQuantity(1,'کارتن','عدد','کارتن',36),36);
  assert.equal(UI_CONTRACT.saleBaseQuantity(2,'عدد','عدد','کارتن',36),2);
});

test('check workflow exposes explicit status, destination and returned flag',()=>{
  assert.deepEqual(UI_CONTRACT.checkFields,['status','destination','returned']);
  assert.deepEqual(UI_CONTRACT.checkStatuses,['نزد ما','تودیع‌شده','وصول شده','برگشتی','باطل']);
});

test('warehouse and tier records are editable without deleting history',()=>{
  assert.equal(UI_CONTRACT.warehouseActions.includes('edit'),true);
  assert.equal(UI_CONTRACT.warehouseActions.includes('delete'),true);
  assert.equal(UI_CONTRACT.tierActions.includes('edit'),true);
  assert.equal(UI_CONTRACT.tierActions.includes('active'),true);
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadApp() {
  const context = {
    console,
    localStorage: { _data:{}, getItem(k){return this._data[k]??null;}, setItem(k,v){this._data[k]=String(v);} },
    crypto,
  };
  context.globalThis=context;
  for (const file of ['domain.js','operations.js','data.js','transactions.js']) {
    vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  }
  return context;
}

test('sale uses customer-specific price history and converts carton quantity to base units',()=>{
  const {DB,Transactions}=loadApp();
  const p=DB.addPerson({id:'M1',name:'میثم',roles:['customer']});
  DB.addProduct({id:'Z',code:'Z',name:'کالای Z',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36,pricingUnit:'عدد',warehouseId:'FG'});
  DB.addPrice({id:'PX1',productId:'Z',customerId:null,effectiveDate:'1405/06/20',price:300000});
  DB.addPrice({id:'PX2',productId:'Z',customerId:p.id,effectiveDate:'1405/06/20',price:345000});
  const sale=Transactions.addSale({customerId:p.id,productId:'Z',salesUnit:'کارتن',quantity:2,jDate:'1405/06/25'});
  assert.equal(sale.priceId,'PX2');
  assert.equal(sale.baseQuantity,72);
  assert.equal(sale.unitPrice,12420000);
  assert.equal(sale.amount,24840000);
  assert.equal(sale.manualPrice,false);
});

test('manual sale price overrides suggested price without losing price history reference',()=>{
  const {DB,Transactions}=loadApp();
  const p=DB.addPerson({id:'M2',name:'محسن',roles:['customer']});
  DB.addProduct({id:'Z',name:'کالای Z',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36,pricingUnit:'عدد',warehouseId:'FG'});
  DB.addPrice({id:'PX3',productId:'Z',customerId:p.id,effectiveDate:'1405/06/20',price:350000});
  const sale=Transactions.addSale({customerId:p.id,productId:'Z',salesUnit:'کارتن',quantity:1,unitPrice:13000000,jDate:'1405/06/25'});
  assert.equal(sale.priceId,'PX3');
  assert.equal(sale.manualPrice,true);
  assert.equal(sale.unitPrice,13000000);
  assert.equal(sale.amount,13000000);
});

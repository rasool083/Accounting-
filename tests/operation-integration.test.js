'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function loadApp(){
  const context={console,localStorage:{_data:{},getItem(k){return this._data[k]??null;},setItem(k,v){this._data[k]=String(v);}}};
  context.globalThis=context;
  for(const file of ['domain.js','operations.js','data.js','transactions.js']) vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  return context;
}

test('two posted transactions receive distinct OperationIDs and AuditIDs',()=>{
  const {DB,Transactions}=loadApp();
  Transactions.addExpense({amount:100,jDate:'1405/06/01'});
  Transactions.addExpense({amount:200,jDate:'1405/06/02'});
  assert.equal(DB.state.operations.length,2);
  assert.notEqual(DB.state.operations[0].OperationID,DB.state.operations[1].OperationID);
  assert.notEqual(DB.state.audit[0].AuditID,DB.state.audit[1].AuditID);
  assert.equal(DB.state.operations.every(x=>x.Status==='POSTED'),true);
});

test('sale operation id is persisted on the sale record for downstream allocation tracing',()=>{
  const {DB,Transactions}=loadApp();
  const p=Transactions.addCustomer({id:'C1',name:'مشتری'});
  Transactions.addProduct({id:'P1',name:'کالا',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36,pricingUnit:'عدد'});
  Transactions.addPrice({id:'PR1',productId:'P1',effectiveDate:'1405/06/01',price:100});
  const sale=Transactions.addSale({customerId:p.id,productId:'P1',quantity:1,jDate:'1405/06/01'});
  assert.ok(sale.operationId);
  assert.equal(sale.operationId,DB.state.operations.find(x=>x.OperationType==='SALE').OperationID);
});

test('receipt allocation carries the receipt OperationID',()=>{
  const {DB,Transactions}=loadApp();
  const p=Transactions.addCustomer({id:'C1',name:'مشتری'});
  Transactions.addProduct({id:'P1',name:'کالا',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36,pricingUnit:'عدد'});
  Transactions.addPrice({id:'PR1',productId:'P1',effectiveDate:'1405/06/01',price:100});
  Transactions.addSale({customerId:p.id,productId:'P1',quantity:1,jDate:'1405/06/01'});
  const receipt=Transactions.addReceipt({customerId:p.id,type:'نقد',amount:100,jDate:'1405/06/02'});
  assert.ok(receipt.operationId);
  const f=Transactions.customerStatement(p.id,'1405/06/02');
  assert.equal(f.receiptAllocations.length,1);
  assert.equal(f.receiptAllocations[0].ReceiptID,receipt.id);
  const alloc=DB.state.receiptAllocations?.[0];
  assert.equal(alloc?.OperationID,receipt.operationId);
});

test('reversal preserves quantity reversal for inventory effects',()=>{
  const {OperationEngine}=require('../operations');
  const e=new OperationEngine();
  const r=e.execute({operationType:'SALE',idempotencyKey:'S1',actorId:'U1',payload:{id:'S1'}},()=>[{EffectType:'SALE',Value:100,Quantity:5}]);
  const rev=e.reverse(r.operation.OperationID,{idempotencyKey:'RS1',actorId:'U1'});
  assert.equal(rev.effects[0].Value,-100);
  assert.equal(rev.effects[0].Quantity,-5);
  assert.equal(rev.effects[0].ReversesEffectID,r.effects[0].EffectID);
});

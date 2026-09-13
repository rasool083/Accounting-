'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Finance}=require('../domain.js');
const fs=require('node:fs');const vm=require('node:vm');
function loadApp(){const context={console,localStorage:{_data:{},getItem(k){return this._data[k]??null;},setItem(k,v){this._data[k]=String(v);}}};context.globalThis=context;for(const file of ['domain.js','operations.js','data.js','transactions.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});return context;}

test('receipt allocation uses the payment package assigned to each sale',()=>{
  const result=Finance.buildReceiptAllocations({customerId:'C1',calcDate:'1405/08/01',settings:{dayBasis:30,paymentPackages:[{id:'St1',tiers:[{maxDays:30,rate:0,active:true},{maxDays:60,rate:0.06,active:true}]},{id:'St2',tiers:[{maxDays:30,rate:0,active:true},{maxDays:60,rate:0.10,active:true}]}]},sales:[{id:'S1',customerId:'C1',jDate:'1405/06/17',amount:100,paymentPackageId:'St1'},{id:'S2',customerId:'C1',jDate:'1405/06/17',amount:100,paymentPackageId:'St2'}],receipts:[{id:'R1',customerId:'C1',jDate:'1405/08/01',amount:100,status:'وصول شده'}]});
  assert.equal(result.rows.length,1);
  assert.equal(result.rows[0].SaleID,'S1');
  assert.equal(result.rows[0].DurationDays,45);
  assert.equal(result.rows[0].Multiplier,1.09);
});

test('editing payment package changes calculation for invoices assigned to that package',()=>{
  const {DB,Transactions}=loadApp();
  DB.state.paymentPackages=[{id:'St1',name:'St1',active:true,tiers:[{maxDays:30,rate:0,active:true},{maxDays:60,rate:0.06,active:true}]}];
  const p=DB.addPerson({id:'C1',name:'میثم',roles:['customer'],paymentPackageId:'St1'});
  DB.addProduct({id:'Z',name:'Z',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36,pricingUnit:'عدد',warehouseId:'FG'});
  DB.addPrice({id:'PX',productId:'Z',effectiveDate:'1405/06/01',price:100});
  const sale=Transactions.addSale({customerId:p.id,productId:'Z',salesUnit:'عدد',quantity:1,jDate:'1405/06/01'});
  assert.equal(sale.paymentPackageId,'St1');
  DB.state.paymentPackages[0].tiers[1].rate=0.10;DB.save();
  const summary=Transactions.customerStatement(p.id,'1405/08/01');
  assert.ok(summary.totalInt>0);
  assert.ok(Math.abs(summary.totalInt-0.5)<1e-9);
});

test('check status change creates an immutable event and keeps replacement linkage',()=>{
  const {DB,Transactions}=loadApp();
  const p=DB.addPerson({id:'C2',name:'محسن',roles:['customer']});
  const receipt=Transactions.addReceipt({customerId:p.id,type:'چک',amount:5000000,jDate:'1405/06/20',status:'نزد ما',checkNo:'CH-1',bank:'A',dueDate:'1405/07/20'});
  const changed=Transactions.changeReceiptStatus(receipt.id,'وصول شده',{actualDate:'1405/07/20'});
  assert.equal(changed.status,'وصول شده');
  assert.equal(DB.state.checkEvents.length,1);
  assert.equal(DB.state.checkEvents[0].fromStatus,'نزد ما');
  assert.equal(DB.state.checkEvents[0].toStatus,'وصول شده');
  assert.equal(DB.state.checkEvents[0].receiptId,receipt.id);
});

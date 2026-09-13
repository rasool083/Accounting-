'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function loadApp(){const context={console,localStorage:{_data:{},getItem(k){return this._data[k]??null;},setItem(k,v){this._data[k]=String(v);}},structuredClone};context.globalThis=context;for(const file of ['domain.js','operations.js','business-modules.js','data.js','transactions.js','transactions-modules.js','transactions-ui-support.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});return context;}

test('unified support records discount and excludes placeholder products',()=>{
 const {DB,Transactions}=loadApp();
 const p=DB.addPerson({id:'C1',name:'مشتری',roles:['customer']});
 Transactions.addProduct({id:'P1',name:'محصول',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36,pricingUnit:'عدد'});
 DB.addPrice({id:'PX',productId:'P1',effectiveDate:'1405/06/01',price:100000});
 Transactions.addSale({customerId:p.id,productId:'P1',salesUnit:'کارتن',quantity:1,jDate:'1405/06/01'});
 Transactions.addDiscount({customerId:p.id,amount:1000000,jDate:'1405/06/02',reason:'تخفیف حسابی'});
 assert.equal(DB.state.discounts.length,1); assert.equal(DB.state.sales.length,1); assert.equal(DB.state.sales[0].productId,'P1');
 const s=Transactions.customerStatement(p.id,'1405/06/20'); assert.equal(s.balance,2600000); assert.equal(s.totalDiscounts,1000000);
});

test('check status target is stored and replacement may be cash without reopening original debt',()=>{
 const {DB,Transactions}=loadApp();
 const p=DB.addPerson({id:'C2',name:'مشتری 2',roles:['customer']});
 Transactions.addProduct({id:'P2',name:'محصول 2',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:1,pricingUnit:'عدد'});
 DB.addPrice({id:'PX2',productId:'P2',effectiveDate:'1405/06/01',price:1000000});
 Transactions.addSale({customerId:p.id,productId:'P2',salesUnit:'عدد',quantity:1,jDate:'1405/06/01'});
 const acct=Transactions.addTreasuryAccount({id:'A1',name:'بانک سپه',type:'bank'});
 const r=Transactions.addReceipt({customerId:'C2',type:'چک',amount:1000000,jDate:'1405/06/01',status:'نزد ما',checkNo:'C-1',bank:'بانک',dueDate:'1405/07/01'});
 Transactions.updateCheckTarget(r.id,{status:'وصول شده',targetId:acct.id,targetType:'account',actualDate:'1405/06/10'});
 assert.equal(DB.state.receipts[0].status,'وصول شده'); assert.equal(DB.state.receipts[0].statusTargetId,acct.id); assert.equal(DB.state.receipts[0].statusTargetType,'account');
 Transactions.updateCheckTarget(r.id,{status:'برگشتی',targetId:acct.id,targetType:'account',actualDate:'1405/06/12'});
 const repl=Transactions.replaceCheckV2(r.id,{type:'نقد',amount:1000000,jDate:'1405/06/13'});
 assert.equal(repl.replacementOfReceiptId,r.id); assert.equal(repl.type,'نقد');
 const s=Transactions.customerStatement('C2','1405/06/20'); assert.equal(s.balance,0); assert.equal(s.totalReceipts,1000000);
});

test('payment stores direction method and treasury account',()=>{
 const {DB,Transactions}=loadApp();
 DB.addPerson({id:'P1',name:'تأمین‌کننده',roles:['supplier']}); const a=Transactions.addTreasuryAccount({id:'A2',name:'صندوق',type:'cash'});
 const r=Transactions.addPaymentV2({payeeId:'P1',amount:500000,jDate:'1405/06/20',method:'کارت',accountId:a.id});
 assert.equal(r.method,'کارت'); assert.equal(r.accountId,a.id); assert.equal(r.direction,'PAYMENT');
});

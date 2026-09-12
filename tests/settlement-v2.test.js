const test=require('node:test');
const assert=require('node:assert/strict');
const {DateEngine,Finance}=require('../domain.js');
const settings={dayBasis:30,tiers:[{maxDays:9999,rate:0,active:true}],graceDays:30};

test('settlement engine validates Jalali dates',()=>{assert.equal(DateEngine.parseJ('1405/06/21')[0],1405);assert.equal(DateEngine.parseJ('1405/12/31'),null);});

test('future check is not an effective receipt before due date',()=>{const r=Finance.customerSummary({customerId:'c1',calcDate:'1405/06/10',settings,sales:[{id:'s1',customerId:'c1',jDate:'1405/06/01',amount:100}],receipts:[{id:'r1',customerId:'c1',jDate:'1405/06/01',type:'چک',amount:100,dueDate:'1405/06/20',status:'نزد ما'}],checks:[{id:'c1',direction:'in',customerId:'c1',amount:100,dueDate:'1405/06/20',status:'نزد ما'}]});assert.equal(r.principal,100);assert.equal(r.futureChecks,100);});

test('same check becomes effective when marked collected on or before calculation date',()=>{const r=Finance.customerSummary({customerId:'c1',calcDate:'1405/06/21',settings,sales:[{id:'s1',customerId:'c1',jDate:'1405/06/01',amount:100}],receipts:[{id:'r1',customerId:'c1',jDate:'1405/06/20',type:'چک',amount:100,dueDate:'1405/06/20',status:'وصول شده'}],checks:[{id:'c1',direction:'in',customerId:'c1',amount:100,dueDate:'1405/06/20',status:'وصول شده'}]});assert.equal(r.principal,0);assert.equal(r.totalReceipts,100);});

test('returned check does not remain a credit to customer and reopens the debt',()=>{const r=Finance.customerSummary({customerId:'c1',calcDate:'1405/06/21',settings,sales:[{id:'s1',customerId:'c1',jDate:'1405/06/01',amount:100}],receipts:[{id:'r1',customerId:'c1',jDate:'1405/06/10',type:'چک',amount:100,dueDate:'1405/06/15',status:'برگشتی'}],checks:[{id:'c1',direction:'in',customerId:'c1',amount:100,dueDate:'1405/06/15',status:'برگشتی'}]});assert.equal(r.principal,100);assert.equal(r.returnedChecks,100);});

test('sale return linked to invoice reduces the FIFO principal',()=>{const r=Finance.customerSummary({customerId:'c1',calcDate:'1405/06/21',settings,sales:[{id:'s1',customerId:'c1',jDate:'1405/06/01',amount:100}],saleReturns:[{id:'sr1',customerId:'c1',referenceId:'s1',jDate:'1405/06/05',amount:30}] ,receipts:[],checks:[]});assert.equal(r.principal,70);});

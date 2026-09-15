'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Finance}=require('../domain.js');

test('invoice payment package controls the tier multiplier',()=>{
  const packages=[{id:'PKG-A',dayBasis:30,tiers:[{maxDays:30,rate:0,active:true},{maxDays:60,rate:.06,active:true}]}];
  const out=Finance.fifo({customerId:'C1',calcDate:'1405/07/16',settings:{dayBasis:30,tiers:[]},paymentPackages:packages,
    sales:[{id:'S1',customerId:'C1',jDate:'1405/06/02',amount:100,paymentPackageId:'PKG-A'}],
    receipts:[{id:'R1',customerId:'C1',jDate:'1405/07/16',amount:104.5,status:'نزد ما'}]});
  assert.equal(out.receiptAllocations.length,1);
  assert.equal(out.receiptAllocations[0].DurationDays,45);
  assert.equal(out.receiptAllocations[0].Multiplier,1.09);
  assert.equal(out.receiptAllocations[0].PrincipalReduction,104.5/1.09);
});

test('received check is counted from receipt date even before collection',()=>{
  const out=Finance.customerSummary({customerId:'C1',calcDate:'1405/06/20',settings:{dayBasis:30,tiers:[{maxDays:30,rate:0,active:true}]},paymentPackages:[],
    sales:[{id:'S1',customerId:'C1',jDate:'1405/06/01',amount:100}],
    receipts:[{id:'R1',customerId:'C1',jDate:'1405/06/10',amount:100,status:'نزد ما'}]});
  assert.equal(out.balance,0);
  assert.equal(out.totalReceipts,100);
});

test('returned check is excluded from effective receipts',()=>{
  const out=Finance.customerSummary({customerId:'C1',calcDate:'1405/06/20',settings:{dayBasis:30,tiers:[{maxDays:30,rate:0,active:true}]},paymentPackages:[],
    sales:[{id:'S1',customerId:'C1',jDate:'1405/06/01',amount:100}],
    receipts:[{id:'R1',customerId:'C1',jDate:'1405/06/10',amount:100,status:'برگشتی',returned:true}]});
  assert.equal(out.balance,100);
  assert.equal(out.totalReceipts,0);
});

test('discount document reduces customer balance without a product quantity',()=>{
  const out=Finance.customerSummary({customerId:'C1',calcDate:'1405/06/20',settings:{dayBasis:30,tiers:[{maxDays:30,rate:0,active:true}]},paymentPackages:[],
    sales:[{id:'S1',customerId:'C1',jDate:'1405/06/01',amount:100},{id:'D1',customerId:'C1',jDate:'1405/06/15',amount:-3,netAmount:-3,isDiscountDocument:true}],
    receipts:[]});
  assert.equal(out.totalSales,97);
  assert.equal(out.balance,97);
});

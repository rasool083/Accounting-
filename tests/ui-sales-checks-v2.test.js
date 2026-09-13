'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Finance}=require('../domain.js');

test('one carton uses package factor in sale amount',()=>{
  const r=Finance.saleLine({quantity:1,basePrice:100000,unit:'کارتن',baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36});
  assert.equal(r.factor,36);
  assert.equal(r.unitPrice,3600000);
  assert.equal(r.amount,3600000);
  assert.equal(r.baseQuantity,36);
});

test('customer discount reduces principal without creating a product line',()=>{
  const r=Finance.fifo({customerId:'C1',calcDate:'1405/06/20',settings:{dayBasis:30,tiers:[{maxDays:9999,rate:0,active:true}]},sales:[{id:'S1',customerId:'C1',jDate:'1405/06/01',amount:1000}],receipts:[],discounts:[{id:'D1',customerId:'C1',jDate:'1405/06/10',amount:250,status:'POSTED'}]});
  assert.equal(r.totalRem,750);
  assert.equal(r.totalDiscounts,250);
});

test('future or non-collected checks do not reduce actual balance',()=>{
  const base={customerId:'C1',calcDate:'1405/06/20',settings:{dayBasis:30,tiers:[{maxDays:9999,rate:0,active:true}]},sales:[{id:'S1',customerId:'C1',jDate:'1405/06/01',amount:1000}]};
  const pending=Finance.customerSummary({...base,receipts:[{id:'R1',customerId:'C1',jDate:'1405/06/05',dueDate:'1405/07/01',type:'چک',status:'نزد ما',amount:1000}]});
  assert.equal(pending.totalReceipts,0);
  assert.equal(pending.balance,1000);
  const collected=Finance.customerSummary({...base,receipts:[{id:'R1',customerId:'C1',jDate:'1405/06/05',dueDate:'1405/07/01',type:'چک',status:'وصول شده',amount:1000}]});
  assert.equal(collected.totalReceipts,1000);
  assert.equal(collected.balance,0);
});

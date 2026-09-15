'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Finance}=require('../domain.js');

test('returned flag makes a check-backed receipt financially ineffective even when status is deposited',()=>{
  const input={customerId:'C1',calcDate:'1405/01/10',settings:{dayBasis:30,tiers:[{maxDays:30,rate:0,active:true}]},sales:[{id:'S1',customerId:'C1',jDate:'1405/01/01',amount:100}],receipts:[{id:'R1',customerId:'C1',jDate:'1405/01/10',amount:100,status:'تودیع‌شده',returned:true}]};
  const r=Finance.fifo(input);
  assert.equal(r.totalRem,100);
  assert.equal(r.totalSV,100);
  assert.equal(r.receiptAllocations.length,0);
});

test('non-returned deposited receipt still participates in FIFO',()=>{
  const input={customerId:'C1',calcDate:'1405/01/10',settings:{dayBasis:30,tiers:[{maxDays:30,rate:0,active:true}]},sales:[{id:'S1',customerId:'C1',jDate:'1405/01/01',amount:100}],receipts:[{id:'R1',customerId:'C1',jDate:'1405/01/10',amount:100,status:'تودیع‌شده',returned:false}]};
  const r=Finance.fifo(input);
  assert.equal(r.totalRem,0);
  assert.equal(r.receiptAllocations.length,1);
});

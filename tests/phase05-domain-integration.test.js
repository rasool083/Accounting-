'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ContractEngine}=require('../phase05.js');

test('contract allocation uses the financial domain tier rule for settlement and principal reduction',()=>{
  const e=new ContractEngine();
  e.addSale({id:'S1',customerId:'C1',jDate:'1405/06/01',amount:100});
  e.addReceipt({id:'R1',customerId:'C1',jDate:'1405/07/15',amount:109,status:'وصول شده'});
  const rows=e.allocateReceipt('R1','1405/07/15',{dayBasis:30,tiers:[{maxDays:30,rate:0,active:true},{maxDays:60,rate:0.06,active:true}]});
  assert.equal(rows.length,1);
  assert.equal(rows[0].DurationDays,45);
  assert.ok(Math.abs(rows[0].Multiplier-1.09)<1e-12);
  assert.equal(rows[0].SettlementAmount,109);
  assert.ok(Math.abs(rows[0].PrincipalReduction-100)<1e-12);
});

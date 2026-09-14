'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {saleAmounts,transactionClass,pages}=require('../ui-v2.js');

test('canonical UI exposes the agreed page set and central modal implementation',()=>{
  assert.deepEqual(pages.map(x=>x[0]),['dashboard','people','products','warehouses','inventory','prices','sales','settlement','packages','accounts','purchases','production','reports','settings']);
  const src=fs.readFileSync(require.resolve('../ui-v2.js'),'utf8');
  assert.match(src,/function Modal|function modal/);
  assert.match(src,/window\.App\.render=render/);
});

test('sale amount contract uses selected package unit and discount',()=>{
  const sale=saleAmounts(null,'package',1,100000,3600000,300000);
  assert.equal(sale.unitPrice,3600000);
  assert.equal(sale.grossAmount,3600000);
  assert.equal(sale.discount,300000);
  assert.equal(sale.netAmount,3300000);
});

test('transaction row colors distinguish receipt, payment, collected and returned',()=>{
  assert.equal(transactionClass({type:'دریافت',status:'نزد ما'}),'v2-received');
  assert.equal(transactionClass({type:'پرداخت',status:'نزد ما'}),'v2-paid');
  assert.equal(transactionClass({type:'دریافت',status:'وصول شده'}),'v2-collected');
  assert.equal(transactionClass({type:'دریافت',status:'برگشتی'}),'v2-returned');
});

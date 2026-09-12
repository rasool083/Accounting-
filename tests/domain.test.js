const test = require('node:test');
const assert = require('node:assert/strict');
const { DateEngine, Finance } = require('../domain.js');

test('Jalali conversion round-trips a known date', () => {
  const g = DateEngine.j2g(1405, 6, 21);
  assert.deepEqual(DateEngine.g2j(g[0], g[1], g[2]), [1405, '06', '21']);
});

test('date difference is deterministic', () => {
  assert.equal(DateEngine.diffJ([1405,6,1], [1405,6,11]), 10);
});

test('FIFO allocates one receipt across oldest sales first', () => {
  const result = Finance.fifo({customerId:'c1',calcDate:'1405/06/21',settings:{dayBasis:30,tiers:[{maxDays:9999,rate:0,active:true}]},sales:[{id:'s1',customerId:'c1',jDate:'1405/06/01',amount:100},{id:'s2',customerId:'c1',jDate:'1405/06/05',amount:200}],receipts:[{id:'r1',customerId:'c1',jDate:'1405/06/10',amount:150,status:'وصول شده'}]});
  assert.equal(result.alloc[0].remaining,0);assert.equal(result.alloc[1].remaining,150);
});

test('returned and void receipts do not reduce debt', () => {
  const result = Finance.fifo({customerId:'c1',calcDate:'1405/06/21',settings:{dayBasis:30,tiers:[{maxDays:9999,rate:0,active:true}]},sales:[{id:'s1',customerId:'c1',jDate:'1405/06/01',amount:100}],receipts:[{id:'r1',customerId:'c1',jDate:'1405/06/02',amount:50,status:'برگشتی'},{id:'r2',customerId:'c1',jDate:'1405/06/03',amount:25,status:'باطل'}]});
  assert.equal(result.totalRem,100);
});

test('tier interest uses day basis', () => {
  const m=Finance.getMultiplier(60,[{maxDays:30,rate:0,active:true},{maxDays:60,rate:0.06,active:true}],30);
  assert.ok(Math.abs(m-1.12)<1e-12);
});

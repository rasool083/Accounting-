const test = require('node:test');
const assert = require('node:assert/strict');
const { Transactions } = require('../transactions.js');

test('check requires amount and due date', () => {
  assert.throws(() => Transactions.addCheck({customerId:'c1', amount:0}), /amount/);
  assert.throws(() => Transactions.addCheck({customerId:'c1', amount:100}), /dueDate/);
});

test('check creation assigns a stable id and lifecycle status', () => {
  const r = Transactions.addCheck({customerId:'c1', amount:100, dueDate:'1405/07/01'});
  assert.ok(r.id);
  assert.equal(r.status, 'نزد ما');
});

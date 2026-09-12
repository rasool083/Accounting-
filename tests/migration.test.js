const test = require('node:test');
const assert = require('node:assert/strict');
const { Migration } = require('../migration.js');

test('migration preserves core arrays and adds normalized collections', () => {
  const out = Migration.normalize({people:[{id:'p1'}], sales:[{id:'s1'}]});
  assert.deepEqual(out.people, [{id:'p1'}]);
  assert.deepEqual(out.sales, [{id:'s1'}]);
  for (const key of ['products','prices','receipts','payments','checks','purchases','expenses','incomes','audit']) assert.ok(Array.isArray(out[key]));
});

test('migration preserves unknown root properties', () => {
  const out = Migration.normalize({customFlag:true});
  assert.equal(out.customFlag, true);
});

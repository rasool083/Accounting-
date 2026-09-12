const test = require('node:test');
const assert = require('node:assert/strict');
const { Backup } = require('../backup.js');

test('backup round-trips normalized collections', () => {
  const state = {people:[{id:'p1'}], sales:[{id:'s1',amount:100}], settings:{dayBasis:30}};
  const restored = Backup.import(Backup.export(state));
  assert.deepEqual(restored.people, state.people);
  assert.deepEqual(restored.sales, state.sales);
  assert.equal(restored.settings.dayBasis, 30);
});

test('backup import rejects malformed JSON', () => {
  assert.throws(() => Backup.import('{bad'), /JSON/);
});

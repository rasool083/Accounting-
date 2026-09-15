'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizeV3Tab, safeRenderV3} = require('../ui-runtime-guards');

test('legacy tabs normalize to dashboard', () => {
  assert.equal(normalizeV3Tab('receipts'), 'dashboard');
  assert.equal(normalizeV3Tab('checks'), 'dashboard');
  assert.equal(normalizeV3Tab('sales'), 'sales');
});

test('safe render retries on dashboard after a failed stale-tab render', () => {
  const data = new Map([['v3-tab','checks']]);
  const storage = {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const main = {innerHTML:''};
  let calls = 0;
  const result = safeRenderV3(() => { if (++calls === 1) throw new Error('stale tab'); }, storage, main);
  assert.equal(result.ok, true);
  assert.equal(data.get('v3-tab'), 'dashboard');
  assert.equal(calls, 2);
});

test('real bootstrap failure is surfaced instead of leaving main blank', () => {
  const data = new Map([['v3-tab','dashboard']]);
  const storage = {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const main = {innerHTML:''};
  const result = safeRenderV3(() => { throw new Error('broken dependency'); }, storage, main);
  assert.equal(result.ok, false);
  assert.match(main.innerHTML, /خطای بارگذاری رابط/);
});

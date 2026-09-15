'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizeTab, safeRender} = require('../ui-runtime-guards');

test('legacy tabs normalize to dashboard', () => {
  assert.equal(normalizeTab('receipts'), 'dashboard');
  assert.equal(normalizeTab('checks'), 'dashboard');
  assert.equal(normalizeTab('sales'), 'sales');
  assert.equal(normalizeTab('statement'), 'statement');
});

test('safe render retries on dashboard after a failed stale-tab render', () => {
  const data = new Map([['u-tab','checks']]);
  const storage = {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const main = {innerHTML:''};
  let calls = 0;
  const result = safeRender(() => { if (++calls === 1) throw new Error('stale tab'); }, storage, main);
  assert.equal(result.ok, true);
  assert.equal(data.get('u-tab'), 'dashboard');
  assert.equal(data.get('v3-tab'), 'dashboard');
  assert.equal(calls, 2);
});

test('real bootstrap failure is surfaced instead of leaving main blank', () => {
  const data = new Map([['u-tab','dashboard']]);
  const storage = {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const main = {innerHTML:''};
  const result = safeRender(() => { throw new Error('broken dependency'); }, storage, main);
  assert.equal(result.ok, false);
  assert.match(main.innerHTML, /خطای بارگذاری رابط/);
});

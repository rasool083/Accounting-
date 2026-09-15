'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('people editor override is not loaded; stable people UI remains authoritative',()=>{
  const index=read('index.html');
  assert.equal(index.includes('ui-people-products-v1.js'),false);
  assert.equal(index.includes('people-ui.js'),true);
});

test('all data-entry modals use one centered responsive shell',()=>{
  const css=read('ui-fix-v5.css');
  assert.match(css,/position:fixed!important/);
  assert.match(css,/align-items:center!important/);
  assert.match(css,/justify-content:center!important/);
  assert.match(css,/width:min\(560px,calc\(100vw - 24px\)\)/);
});

test('warehouse editor supports create, edit, deactivate and type/status',()=>{
  const js=read('ui-fix-v5.js');
  assert.match(js,/warehousesPage\(\)/);
  assert.match(js,/saveWarehouse\(\)/);
  assert.match(js,/openWarehouse\(rawId\)/);
  assert.match(js,/deactivateWarehouse\(i\)/);
  assert.match(js,/مواد اولیه/);
  assert.match(js,/محصول تولیدی/);
  assert.match(js,/بازرگانی/);
});

test('payment package tiers support separate modal editing and active/inactive state',()=>{
  const js=read('ui-fix-v5.js');
  assert.match(js,/openTier\(i\)/);
  assert.match(js,/saveTier\(\)/);
  assert.match(js,/v5-tier-active/);
  assert.match(js,/edit:tier:/);
  assert.match(js,/delete:tier:/);
});

test('cache-busting version is advanced for the UI repair',()=>{
  const index=read('index.html');
  assert.match(index,/ui-stable-v5/);
  assert.match(index,/ui-fix-v5\.js/);
  assert.match(index,/ui-fix-v5\.css/);
});

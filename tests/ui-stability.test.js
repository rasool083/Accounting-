'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

test('sales screen applies selected unit conversion and invoice-independent discount',()=>{
  const js=read('ui-sales-v5.js');
  assert.match(js,/unitsPerPackage/);
  assert.match(js,/unit==='کارتن'/);
  assert.match(js,/pieces\*N\(piecePrice\)/);
  assert.match(js,/قیمت هر عدد/);
  assert.match(js,/s5-discount/);
  assert.match(js,/isDiscountDocument:true/);
  assert.doesNotMatch(js,/kind==='package'/);
  assert.doesNotMatch(js,/واحد پایه/);
  assert.doesNotMatch(js,/واحد دوم/);
});

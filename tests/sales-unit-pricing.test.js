'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function loadSalesUI(){
  const code=fs.readFileSync(require('node:path').join(__dirname,'..','ui-sales-v5.js'),'utf8');
  const sandbox={
    DB:{people:[],products:[],prices:[],sales:[],todayJ:()=> '1405/06/01'},
    document:{addEventListener(){},getElementById(){return null}},
    sessionStorage:{getItem(){return 'dashboard'}},
    root:null,
    toast(){},
    uid:()=> 'ID',
    console
  };
  sandbox.globalThis=sandbox;
  sandbox.window=sandbox;
  vm.runInNewContext(code,sandbox,{filename:'ui-sales-v5.js'});
  return sandbox;
}

test('sales pricing uses piece price history for both عدد and کارتن',()=>{
  const w=loadSalesUI();
  assert.ok(w.SaleUnitPricing,'SaleUnitPricing helper is required');
  const product={baseUnit:'عدد',packageUnit:'کارتن',unitsPerPackage:36};
  const piecePrice=125000;
  const onePiece=w.SaleUnitPricing.calculate({product,unit:'عدد',quantity:2,piecePrice,discount:0});
  assert.equal(onePiece.baseQuantity,2);
  assert.equal(onePiece.unitPrice,125000);
  assert.equal(onePiece.gross,250000);

  const oneCarton=w.SaleUnitPricing.calculate({product,unit:'کارتن',quantity:1,piecePrice,discount:0});
  assert.equal(oneCarton.baseQuantity,36);
  assert.equal(oneCarton.unitPrice,125000);
  assert.equal(oneCarton.gross,4500000);

  const discounted=w.SaleUnitPricing.calculate({product,unit:'کارتن',quantity:2,piecePrice,discount:300000});
  assert.equal(discounted.baseQuantity,72);
  assert.equal(discounted.gross,9000000);
  assert.equal(discounted.net,8700000);
});

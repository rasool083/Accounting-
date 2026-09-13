'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {Inventory}=require('../inventory.js');

test('inventory is normalized to base quantity and separated by warehouse',()=>{
  const rows=[
    {id:'P1',productId:'Z',warehouseId:'TR',jDate:'1405/06/01',type:'purchase',baseQty:100},
    {id:'S1',productId:'Z',warehouseId:'TR',jDate:'1405/06/05',type:'sale',baseQty:36},
    {id:'T1O',productId:'Z',warehouseId:'TR',jDate:'1405/06/06',type:'transferOut',baseQty:20,transferId:'T1'},
    {id:'T1I',productId:'Z',warehouseId:'FG',jDate:'1405/06/06',type:'transferIn',baseQty:20,transferId:'T1'}
  ];
  assert.equal(Inventory.stock(rows,'Z','TR','1405/06/10'),44);
  assert.equal(Inventory.stock(rows,'Z','FG','1405/06/10'),20);
});

test('warehouse transfer is balanced by one transfer id',()=>{
  const rows=Inventory.transfer({id:'T1',productId:'Z',fromWarehouseId:'TR',toWarehouseId:'FG',baseQty:20,jDate:'1405/06/06'});
  assert.equal(rows.length,2);
  assert.equal(rows[0].transferId,rows[1].transferId);
  assert.equal(rows[0].baseQty,-20);assert.equal(rows[1].baseQty,20);
});

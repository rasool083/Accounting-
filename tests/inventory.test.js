const test = require('node:test');
const assert = require('node:assert/strict');
const { Inventory } = require('../inventory.js');

test('stock equals purchases minus sales plus returns', () => {
  const rows = [
    {type:'purchase', qty:100, jDate:'1405/06/01'},
    {type:'sale', qty:30, jDate:'1405/06/02'},
    {type:'saleReturn', qty:5, jDate:'1405/06/03'}
  ];
  assert.equal(Inventory.stockFromMovements(rows, '1405/06/04'), 75);
});

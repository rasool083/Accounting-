const test = require('node:test');
const assert = require('node:assert/strict');
const { Reports } = require('../reports.js');

test('historical balance excludes transactions after calcDate', () => {
  const state = {
    sales:[
      {id:'s1', customerId:'c1', jDate:'1405/06/01', amount:100},
      {id:'s2', customerId:'c1', jDate:'1405/07/01', amount:200}
    ], receipts:[]
  };
  assert.equal(Reports.customerBalance({customerId:'c1', calcDate:'1405/06/20', state}).balance, 100);
});

test('statement includes sale and receipt rows in chronological order', () => {
  const state = {
    sales:[{id:'s1', customerId:'c1', jDate:'1405/06/01', amount:100}],
    receipts:[{id:'r1', customerId:'c1', jDate:'1405/06/02', amount:40, status:'وصول شده'}]
  };
  const rows = Reports.customerStatement({customerId:'c1', from:'1405/06/01', to:'1405/06/03', state});
  assert.deepEqual(rows.map(r=>r.id), ['s1','r1']);
});

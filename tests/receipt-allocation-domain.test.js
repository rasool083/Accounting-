'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Finance } = require('../domain.js');

test('domain FIFO exposes immutable-ready receipt allocation rows with exact settlement basis', () => {
  const rows = Finance.buildReceiptAllocations({
    customerId: 'c1',
    calcDate: '1405/06/21',
    settings: { dayBasis: 30, tiers: [{ maxDays: 30, rate: 0, active: true }, { maxDays: 60, rate: 0.06, active: true }] },
    sales: [
      { id: 's1', customerId: 'c1', jDate: '1405/06/01', amount: 100 },
      { id: 's2', customerId: 'c1', jDate: '1405/06/05', amount: 200 }
    ],
    receipts: [{ id: 'r1', customerId: 'c1', jDate: '1405/06/10', amount: 150, status: 'وصول شده' }]
  });

  assert.deepEqual(rows.map(x => [x.ReceiptID, x.SaleID, x.SettlementAmount, x.PrincipalReduction]), [
    ['r1', 's1', 100, 100],
    ['r1', 's2', 50, 50]
  ]);
  assert.equal(rows[0].DurationDays, 9);
  assert.equal(rows[0].Multiplier, 1);
  assert.equal(rows[1].DurationDays, 5);
  assert.equal(rows[1].Multiplier, 1);
});

test('domain FIFO allocation does not allocate returned or void receipts', () => {
  const rows = Finance.buildReceiptAllocations({
    customerId: 'c1',
    calcDate: '1405/06/21',
    settings: { dayBasis: 30, tiers: [{ maxDays: 9999, rate: 0, active: true }] },
    sales: [{ id: 's1', customerId: 'c1', jDate: '1405/06/01', amount: 100 }],
    receipts: [
      { id: 'r1', customerId: 'c1', jDate: '1405/06/02', amount: 50, status: 'برگشتی' },
      { id: 'r2', customerId: 'c1', jDate: '1405/06/03', amount: 25, status: 'باطل' }
    ]
  });
  assert.deepEqual(rows, []);
});

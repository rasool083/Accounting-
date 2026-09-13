'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadDB() {
  const context = {
    console,
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
    },
  };
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(require.resolve('../data.js'), 'utf8'), context, { filename: 'data.js' });
  return context.DB;
}

test('people are multi-role and keep payment package default', () => {
  const DB = loadDB();
  assert.ok(Array.isArray(DB.state.people));
  const person = DB.addPerson({
    name: 'میثم',
    company: 'فروشگاه میثم',
    phone: '0912',
    address: 'تهران',
    roles: ['customer', 'supplier'],
    paymentPackageId: 'St1',
    notes: 'تست',
  });
  assert.deepEqual(person.roles.sort(), ['customer', 'supplier']);
  assert.equal(person.paymentPackageId, 'St1');
  assert.equal(DB.getPerson(person.id).company, 'فروشگاه میثم');
});

test('customer role remains compatible with legacy customer lookup', () => {
  const DB = loadDB();
  const p = DB.addPerson({ name: 'محسن', roles: ['customer'] });
  assert.equal(DB.getCustomer(p.id).id, p.id);
  assert.equal(DB.getCustomer(p.id).role, 'customer');
});

test('products support warehouse/location and predefined sales units', () => {
  const DB = loadDB();
  const p = DB.addProduct({
    code: 'Z',
    name: 'کالای Z',
    baseUnit: 'عدد',
    packageUnit: 'کارتن',
    unitsPerPackage: 36,
    pricingUnit: 'عدد',
    warehouseId: 'FG',
  });
  assert.equal(p.warehouseId, 'FG');
  assert.deepEqual(p.salesUnits, ['عدد', 'کارتن']);
  assert.equal(DB.getProduct(p.id).unitsPerPackage, 36);
});

test('customer-specific price overrides public price for the same product and date', () => {
  const DB = loadDB();
  DB.addPrice({ productId: 'Z', customerId: null, effectiveDate: '1405/06/20', price: 300000 });
  DB.addPrice({ productId: 'Z', customerId: 'M1', effectiveDate: '1405/06/20', price: 345000 });
  DB.addPrice({ productId: 'Z', customerId: 'M2', effectiveDate: '1405/06/20', price: 350000 });
  assert.equal(DB.currentPrice('Z', '1405/06/25', 'M1').price, 345000);
  assert.equal(DB.currentPrice('Z', '1405/06/25', 'M2').price, 350000);
  assert.equal(DB.currentPrice('Z', '1405/06/25', 'M3').price, 300000);
});

test('editing a person preserves identity and updates fields', () => {
  const DB = loadDB();
  const p = DB.addPerson({ name: 'قبل', roles: ['customer'] });
  const edited = DB.updatePerson(p.id, { name: 'بعد', roles: ['customer', 'partner'], notes: 'ویرایش' });
  assert.equal(edited.id, p.id);
  assert.equal(edited.name, 'بعد');
  assert.deepEqual(edited.roles.sort(), ['customer', 'partner']);
  assert.equal(DB.getPerson(p.id).notes, 'ویرایش');
});

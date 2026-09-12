# Accounting System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** تکمیل سامانه فروش و تسویه کارگاه از نمونه فعلی localStorage به یک برنامه ماژولار، قابل تست و آماده توسعه به Supabase/Android.

**Architecture:** UI فقط نمایش و دریافت ورودی را انجام می‌دهد؛ Application services عملیات را orchestration می‌کنند؛ Domain engine تاریخ، FIFO، سود، چک و مانده را محاسبه می‌کند؛ Repository دسترسی به localStorage را کپسوله می‌کند و بعداً قابل جایگزینی با Supabase است.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js built-in test runner, localStorage, JSON backup. بدون dependency خارجی در نسخه local-first.

**Spec:** `docs/superpowers/specs/2026-09-12-accounting-system-design.md`

## Global Constraints

- رابط کاربری فارسی و RTL باقی می‌ماند.
- تاریخ مالی ورودی به صورت `YYYY/MM/DD` جلالی نگهداری می‌شود.
- منطق مالی از UI جدا می‌ماند.
- داده‌های فعلی `people/products/prices/sales/receipts/audit/settings` باید قابل مهاجرت باشند.
- هیچ اتصال زنده به Supabase، WebMCP یا Android بدون پیاده‌سازی و verification ادعا نمی‌شود.
- نسخه local-first بدون dependency خارجی قابل اجرا می‌ماند.
- منطق جدید با TDD ساخته می‌شود: test red، implementation green، refactor.

---

### Task 1: Modularize the application entry point

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `ui.js`
- Test: `tests/smoke.test.js`
- Create: `package.json`

**Interfaces:**
- `index.html` loads `style.css`, `data.js`, `domain.js`, `ui.js`, `app.js` in dependency order.
- Browser entry point exposes `window.App.start()`.

- [ ] **Step 1: Write the failing smoke test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('index is a thin modular entry point', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /style\.css/);
  assert.match(html, /data\.js/);
  assert.match(html, /ui\.js/);
  assert.doesNotMatch(html, /function g2j\(/);
  assert.doesNotMatch(html, /var D=\{/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/smoke.test.js`
Expected: FAIL because the current `index.html` contains inline implementation.

- [ ] **Step 3: Move CSS and inline data/UI code out of `index.html`**

Keep only document structure, stylesheet link, and script tags. Preserve DOM IDs used by existing UI (`sb`, `hd`, `nav`, `main`, `tst`, `lock`, `pinIn`, `pinOk`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/smoke.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css ui.js package.json tests/smoke.test.js
git commit -m "refactor: modularize accounting app entry point"
```

---

### Task 2: Extract and harden the financial domain engine

**Files:**
- Create: `domain.js`
- Modify: `data.js`
- Create: `tests/domain.test.js`

**Interfaces:**
- `DateEngine.g2j(gy, gm, gd) -> [jy, jm, jd]`
- `DateEngine.j2g(jy, jm, jd) -> [gy, gm, gd]`
- `DateEngine.diffJ(a, b) -> integer`
- `Finance.getMultiplier(days, tiers, basis) -> number`
- `Finance.fifo({sales, receipts, customerId, calcDate, settings}) -> result`
- `Finance.customerSummary({sales, receipts, customerId, calcDate, settings}) -> result`

- [ ] **Step 1: Write failing domain tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { DateEngine, Finance } = require('../domain.js');

test('Jalali conversion round-trips a known date', () => {
  const g = DateEngine.j2g(1405, 6, 21);
  assert.deepEqual(DateEngine.g2j(g[0], g[1], g[2]), [1405, '06', '21']);
});

test('FIFO allocates one receipt across oldest sales first', () => {
  const result = Finance.fifo({
    customerId: 'c1',
    calcDate: '1405/06/21',
    settings: {dayBasis: 30, tiers: [{maxDays: 9999, rate: 0, active: true}]},
    sales: [
      {id: 's1', customerId: 'c1', jDate: '1405/06/01', amount: 100},
      {id: 's2', customerId: 'c1', jDate: '1405/06/05', amount: 200}
    ],
    receipts: [{id: 'r1', customerId: 'c1', jDate: '1405/06/10', amount: 150, status: 'وصول شده'}]
  });
  assert.equal(result.alloc[0].remaining, 0);
  assert.equal(result.alloc[1].remaining, 150);
});
```

- [ ] **Step 2: Run to verify RED**

Run: `node --test tests/domain.test.js`
Expected: FAIL because `domain.js` does not yet exist.

- [ ] **Step 3: Implement minimal domain engine**

Move date and finance calculations out of UI/data storage. Preserve current Jalali algorithm as the baseline, then add explicit input validation and deterministic sorting by `jDate`, then `id`.

- [ ] **Step 4: Run domain tests**

Run: `node --test tests/domain.test.js`
Expected: PASS.

- [ ] **Step 5: Add edge-case tests and implementation**

Test zero-rate tiers, multiple receipts, credit, invalid dates, returned/void receipts, historical dates, and tier selection.

- [ ] **Step 6: Run the full domain suite**

Run: `node --test tests/domain.test.js`
Expected: all tests pass with zero failures.

- [ ] **Step 7: Commit**

```bash
git add domain.js data.js tests/domain.test.js
git commit -m "feat: extract deterministic financial domain engine"
```

---

### Task 3: Introduce repository and migration layer

**Files:**
- Create: `repository.js`
- Create: `migration.js`
- Modify: `data.js`
- Create: `tests/migration.test.js`

**Interfaces:**
- `Repository.loadAll() -> DatabaseState`
- `Repository.save(table, rows) -> boolean`
- `Repository.replaceAll(state) -> boolean`
- `Migration.normalize(state) -> DatabaseState`

- [ ] **Step 1: Write migration tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { Migration } = require('../migration.js');

test('migration preserves existing core arrays and adds new collections', () => {
  const out = Migration.normalize({people:[{id:'p1'}], sales:[{id:'s1'}]});
  assert.deepEqual(out.people, [{id:'p1'}]);
  assert.deepEqual(out.sales, [{id:'s1'}]);
  for (const key of ['products','prices','receipts','payments','checks','purchases','expenses','incomes','audit']) {
    assert.ok(Array.isArray(out[key]));
  }
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/migration.test.js`
Expected: FAIL because migration module does not exist.

- [ ] **Step 3: Implement migration and repository**

`Migration.normalize` must never discard unknown existing properties. `Repository` must use the existing `ACC_` storage namespace and return normalized state.

- [ ] **Step 4: Run migration tests**

Run: `node --test tests/migration.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add repository.js migration.js data.js tests/migration.test.js
git commit -m "refactor: add normalized repository and migration layer"
```

---

### Task 4: Expand transaction model: purchases, payments, returns, checks

**Files:**
- Modify: `data.js`
- Modify: `ui.js`
- Create: `tests/transactions.test.js`

**Interfaces:**
- `Transactions.addPurchase(input) -> record`
- `Transactions.addPayment(input) -> record`
- `Transactions.addSaleReturn(input) -> record`
- `Transactions.addPurchaseReturn(input) -> record`
- `Transactions.addCheck(input) -> record`
- `Transactions.validate(input) -> void | throws`

- [ ] **Step 1: Write failing transaction tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { Transactions } = require('../transactions.js');

test('check requires due date and amount', () => {
  assert.throws(() => Transactions.addCheck({customerId:'c1', amount:0}), /amount/);
  assert.throws(() => Transactions.addCheck({customerId:'c1', amount:100}), /dueDate/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/transactions.test.js`
Expected: FAIL because `transactions.js` is absent.

- [ ] **Step 3: Implement validation and record creation**

Use stable IDs, explicit statuses, Jalali dates, and audit entries. Keep check lifecycle states distinct: `نزد ما`, `وصول شده`, `تودیع‌شده`, `برگشتی`, `باطل`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/transactions.test.js`
Expected: PASS.

- [ ] **Step 5: Add UI forms and lists**

Add pages for purchases, payments, checks, returns, and transaction details. Existing sales/receipts forms remain backward-compatible.

- [ ] **Step 6: Commit**

```bash
git add data.js ui.js transactions.js tests/transactions.test.js
 git commit -m "feat: add purchases payments returns and checks"
```

---

### Task 5: Build complete account statement and historical reporting

**Files:**
- Modify: `domain.js`
- Modify: `ui.js`
- Create: `reports.js`
- Create: `tests/reports.test.js`

**Interfaces:**
- `Reports.customerStatement({customerId, from, to, state}) -> rows`
- `Reports.customerBalance({customerId, calcDate}) -> summary`
- `Reports.dashboard(state, calcDate) -> kpis`

- [ ] **Step 1: Write failing historical balance tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { Reports } = require('../reports.js');

test('historical balance excludes transactions after calcDate', () => {
  const state = {
    sales:[
      {id:'s1', customerId:'c1', jDate:'1405/06/01', amount:100},
      {id:'s2', customerId:'c1', jDate:'1405/07/01', amount:200}
    ],
    receipts:[]
  };
  assert.equal(Reports.customerBalance({customerId:'c1', calcDate:'1405/06/20', state}).balance, 100);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/reports.test.js`
Expected: FAIL because reporting module does not exist.

- [ ] **Step 3: Implement report engine**

Filter all source records by the requested period before passing them into the domain engine. Never let a later transaction influence a historical report.

- [ ] **Step 4: Run tests**

Run: `node --test tests/reports.test.js`
Expected: PASS.

- [ ] **Step 5: Replace current statement/month pages**

Provide customer search, from/to dates, original principal, effective receipts, outstanding principal, calculated interest, credit, and detailed FIFO allocation.

- [ ] **Step 6: Commit**

```bash
git add domain.js reports.js ui.js tests/reports.test.js
git commit -m "feat: add historical statements and financial reports"
```

---

### Task 6: Inventory and operational accounting pages

**Files:**
- Create: `inventory.js`
- Modify: `data.js`
- Modify: `ui.js`
- Create: `tests/inventory.test.js`

**Interfaces:**
- `Inventory.stock(productId, asOf) -> quantity`
- `Inventory.movements(productId, from, to) -> rows`
- `Inventory.applySale(sale) -> movement`
- `Inventory.applyPurchase(purchase) -> movement`
- `Inventory.applyReturn(returnRecord) -> movement`

- [ ] **Step 1: Write failing stock tests**

```js
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
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/inventory.test.js`
Expected: FAIL because inventory module is absent.

- [ ] **Step 3: Implement movement-based inventory**

Inventory must derive from transactions rather than a manually edited total. Preserve package/base-unit conversion using product `ppp`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/inventory.test.js`
Expected: PASS.

- [ ] **Step 5: Add inventory UI and product stock indicators**

Add current stock, movement history, low-stock display, and inventory report.

- [ ] **Step 6: Commit**

```bash
git add inventory.js data.js ui.js tests/inventory.test.js
git commit -m "feat: add transaction-derived inventory"
```

---

### Task 7: Backup, restore, audit and settings hardening

**Files:**
- Modify: `ui.js`
- Modify: `data.js`
- Create: `backup.js`
- Create: `tests/backup.test.js`

**Interfaces:**
- `Backup.export(state) -> JSON string`
- `Backup.import(json) -> normalized state`
- `Audit.record(action, table, recordId, note) -> void`

- [ ] **Step 1: Write failing backup round-trip test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { Backup } = require('../backup.js');

test('backup round-trips all normalized collections', () => {
  const state = {people:[{id:'p1'}], sales:[{id:'s1',amount:100}], settings:{dayBasis:30}};
  const restored = Backup.import(Backup.export(state));
  assert.deepEqual(restored.people, state.people);
  assert.deepEqual(restored.sales, state.sales);
  assert.equal(restored.settings.dayBasis, 30);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/backup.test.js`
Expected: FAIL because backup module is absent.

- [ ] **Step 3: Implement JSON export/import and audit retention**

Backup must include schema version, exportedAt, and all normalized collections. Import must reject malformed JSON without mutating current storage.

- [ ] **Step 4: Run tests**

Run: `node --test tests/backup.test.js`
Expected: PASS.

- [ ] **Step 5: Harden settings and lock UI**

Ensure PIN lock does not erase data and settings changes are audited.

- [ ] **Step 6: Commit**

```bash
git add backup.js data.js ui.js tests/backup.test.js
git commit -m "feat: harden backup audit and settings"
```

---

### Task 8: Browser integration and regression verification

**Files:**
- Modify: `app.js`
- Modify: `ui.js`
- Modify: `style.css`
- Create: `tests/browser-contract.test.js`
- Modify: `README.md`

**Interfaces:**
- `App.start() -> void`
- `App.render() -> void`
- `App.load() -> void`

- [ ] **Step 1: Write browser contract tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('all referenced application modules exist', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const src of ['data.js','domain.js','repository.js','migration.js','transactions.js','reports.js','inventory.js','backup.js','ui.js','app.js']) {
    assert.ok(fs.existsSync(src), src + ' is missing');
    assert.match(html, new RegExp(src.replace('.', '\\.') + '"'));
  }
});
```

- [ ] **Step 2: Run RED if integration is incomplete**

Run: `node --test tests/browser-contract.test.js`
Expected: FAIL until every referenced module is present and loaded.

- [ ] **Step 3: Wire application startup**

`app.js` loads normalized state, initializes UI, applies lock state, and exposes the minimal `App` interface.

- [ ] **Step 4: Run the complete test suite**

Run: `node --test tests/*.test.js`
Expected: zero failures.

- [ ] **Step 5: Static contract checks**

Run: `node --check data.js && node --check domain.js && node --check repository.js && node --check migration.js && node --check transactions.js && node --check reports.js && node --check inventory.js && node --check backup.js && node --check ui.js && node --check app.js`
Expected: exit code 0 for every file.

- [ ] **Step 6: Update README**

Document current local-first scope, data model, test command, backup behavior, and explicitly mark Supabase/Android/WebMCP as future integration points unless actually implemented.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: integrate accounting modules and regression suite"
```

---

### Task 9: Final verification and integration branch review

**Files:**
- No new production files unless verification identifies a concrete defect.

- [ ] **Step 1: Run the complete tests again**

Run: `node --test tests/*.test.js`
Expected: zero failures.

- [ ] **Step 2: Run syntax verification again**

Run: `node --check data.js && node --check domain.js && node --check repository.js && node --check migration.js && node --check transactions.js && node --check reports.js && node --check inventory.js && node --check backup.js && node --check ui.js && node --check app.js`
Expected: exit code 0.

- [ ] **Step 3: Review branch diff against main**

Use GitHub compare for `main...accounting-implementation` and verify every changed file belongs to the approved scope.

- [ ] **Step 4: Open a pull request only after verification**

```text
Title: Complete accounting sales and settlement system
Body: Implements the approved accounting design, modular financial engine, transactions, statements, inventory, backup/audit, and regression tests.
Base: main
Head: accounting-implementation
```

- [ ] **Step 5: Do not claim completion until test output and GitHub diff have been inspected**

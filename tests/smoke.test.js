const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('index is a thin modular entry point', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /style\.css/);
  for (const script of ['domain.js','business-modules.js','data.js','inventory.js','transactions.js','reports.js','ui-main.js','app.js']) {
    assert.match(html, new RegExp(script.replace('.', '\\.') + '\\?v='));
  }
  assert.doesNotMatch(html, /ui-phase05\.js|ui-patch\.js|ui-final\.js|ui-completion\.js|ui-unified\.js/);
  assert.doesNotMatch(html, /function g2j\(/);
  assert.doesNotMatch(html, /var D=\{/);
});

test('application modules referenced by the entry point exist', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const src of ['domain.js','business-modules.js','data.js','inventory.js','transactions.js','reports.js','ui-main.js','app.js']) {
    assert.ok(fs.existsSync(src), src + ' is missing');
    assert.match(html, new RegExp(src.replace('.', '\\.') + '\\?v='));
  }
});

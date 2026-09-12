const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('index is a thin modular entry point', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /style\.css/);
  assert.match(html, /data\.js/);
  assert.match(html, /ui\.js/);
  assert.match(html, /accounting-v2\.js/);
  assert.match(html, /app-v2\.js/);
  assert.doesNotMatch(html, /function g2j\(/);
  assert.doesNotMatch(html, /var D=\{/);
});

test('application modules referenced by the entry point exist', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const src of ['data.js','domain.js','repository.js','migration.js','transactions.js','reports.js','inventory.js','backup.js','ui.js','accounting-v2.js','app-v2.js']) {
    assert.ok(fs.existsSync(src), src + ' is missing');
    assert.match(html, new RegExp(src.replace('.', '\\.') + '"'));
  }
});

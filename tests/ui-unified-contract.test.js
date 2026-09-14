'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('unified UI contract is declared and legacy render patches are excluded from entrypoint',()=>{
  const html=fs.readFileSync('index.html','utf8');
  assert.match(html,/ui-unified\\.js/);
  assert.doesNotMatch(html,/ui-final\\.js|ui-patch\\.js|ui-completion\\.js|ui-phase05\\.js/);
  const ui=fs.readFileSync('ui-unified.js','utf8');
  assert.match(ui,/function modal\\(/);
  const css=fs.readFileSync('style.css','utf8');
  assert.match(css,/\.u-modal[^{]*\\{[^}]*position:fixed/);
  assert.match(css,/align-items:center/);
  assert.match(css,/justify-content:center/);
});

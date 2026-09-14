'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('index references only existing script assets', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(src => !src.startsWith('http'));
  for (const src of srcs) assert.equal(fs.existsSync(path.join(root, src.split('?')[0])), true, `missing script asset: ${src}`);
});

test('App.start renders even when optional lock-screen controls are absent', () => {
  const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const listeners = {};
  const elements = {
    'nav': {},
    'main': {},
  };
  const context = {
    console,
    window: {},
    DB: { settings: { pin: '' }, load() {} },
    sessionStorage: { getItem() { return '1'; }, setItem() {}, removeItem() {} },
    document: {
      addEventListener(name, fn) { listeners[name] = fn; },
      getElementById(id) { return elements[id] || null; }
    },
    render() { context.rendered = true; },
    toast() {}
  };
  context.window = context;
  vm.runInNewContext(source, context, { filename: 'app.js' });
  assert.equal(typeof context.App?.start, 'function');
  assert.doesNotThrow(() => context.App.start());
  assert.equal(context.rendered, true);
});

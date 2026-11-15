const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function plugin() {
  const sandbox = { module: { exports: {} }, analysis: {}, history: {},
    settings: { createSettingsTab: () => class {} }, dashboard: {}, setTimeout, clearTimeout,
    require: () => ({ Plugin: class {}, ItemView: class {} }) };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/plugin.js'), 'utf8'), sandbox);
  return new sandbox.module.exports();
}

test('refresh requests during an active scan run again and retain forced refresh', async () => {
  const p = plugin();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const calls = [];
  p.rebuildHistory = async force => { calls.push(force); if (calls.length === 1) await gate; };
  const first = p.refreshHistory();
  const second = p.refreshHistory(true);
  p.refreshHistory(false);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(calls, [false, true]);
  assert.equal(p.refreshing, null);
});

test('unloading during a scan cancels queued refreshes', async () => {
  const p = plugin();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let calls = 0;
  p.rebuildHistory = async () => { calls++; await gate; };
  const scan = p.refreshHistory();
  p.refreshHistory(true);
  p.onunload();
  release();
  await scan;
  assert.equal(calls, 1);
});

test('a failed scan does not discard a queued retry', async () => {
  const p = plugin();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let calls = 0;
  p.rebuildHistory = async () => {
    if (++calls === 1) { await gate; throw new Error('temporary read failure'); }
    p.status = '';
  };
  const scan = p.refreshHistory();
  p.refreshHistory();
  release();
  await scan;
  assert.equal(calls, 2);
  assert.equal(p.status, '');
});

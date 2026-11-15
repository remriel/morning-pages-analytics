const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const history = require("../src/history.js");

function fixture(initial = { preferences: {} }) {
  let stored = initial;
  class BasePlugin {
    factories = {};
    addSettingTab() {}
    registerView(name, factory) { this.factories[name] = factory; }
    addCommand() {}
    addRibbonIcon() {}
    registerEvent() {}
    async loadData() { return stored; }
    async saveData(data) { stored = JSON.parse(JSON.stringify(data)); }
  }
  class ItemView {
    constructor(leaf) { this.contentEl = leaf.contentEl; this.app = leaf.app; }
  }
  const dashboard = { renderHistory(root, input, state, actions) { root.actions = actions; return () => {}; } };
  const sandbox = {
    module: { exports: {} }, analysis: { configureAnalysis() {}, normalizeWordListOverrides: () => ({}) },
    history, dashboard, settings: { createSettingsTab: () => class {} }, setTimeout, clearTimeout,
    require: () => ({ Plugin: BasePlugin, ItemView, PluginSettingTab: class {}, Setting: class {},
      moment: () => ({ format: () => "2031-02-15" }) }),
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/plugin.js"), "utf8"), sandbox);
  const plugin = new sandbox.module.exports();
  plugin.app = { workspace: { on() {}, onLayoutReady() {} }, vault: { on() {} } };
  plugin.onload();
  const open = async () => {
    const view = plugin.factories["morning-pages-history"]({
      app: plugin.app, contentEl: { scrollTop: 0, replaceChildren() {}, querySelector() { return null; } }
    });
    await view.onOpen();
    return view;
  };
  return { plugin, open, saved: () => stored };
}

test("unset opening range remembers presets, navigation, and custom dates", async () => {
  const { plugin, open, saved } = fixture();
  await plugin.ready;
  assert.equal(plugin.preferences.defaultRange, null);
  let view = await open();
  assert.equal(view.state.range, 30, "new installs start at the existing 30-day fallback");
  view.contentEl.actions.change({ range: 90, rangeOffset: 0, rangeChosen: true });
  await plugin.writeTail;
  assert.equal(saved().preferences.lastHistoryRange.range, 90);
  await view.onClose();

  view = await open();
  assert.equal(view.state.range, 90);
  view.contentEl.actions.change({ rangeOffset: -2 });
  await plugin.writeTail;
  await view.onClose();
  view = await open();
  assert.equal(view.state.rangeOffset, -2, "period navigation survives reopening");
  view.contentEl.actions.change({ range: "custom", custom: { start: "2031-01-01", end: "2031-01-12" } });
  await plugin.writeTail;
  await view.onClose();
  view = await open();
  assert.equal(view.state.range, "custom");
  assert.equal(view.state.custom.start, "2031-01-01");
  assert.equal(view.state.custom.end, "2031-01-12");
  const restarted = fixture(saved());
  await restarted.plugin.ready;
  const afterRestart = await restarted.open();
  assert.equal(afterRestart.state.range, "custom", "saved range survives plugin restart");
  assert.equal(afterRestart.state.custom.start, "2031-01-01");

  plugin.preferences.defaultRange = 7;
  await view.onClose();
  view = await open();
  assert.equal(view.state.range, 7, "an explicit default wins on opening");
  plugin.preferences.defaultRange = null;
  await view.onClose();
  view = await open();
  assert.equal(view.state.range, "custom", "clearing the default restores the last used range");
});

test("invalid saved range state is ignored", async () => {
  const { plugin, open } = fixture({ preferences: { defaultRange: 15,
    lastHistoryRange: { range: "custom", custom: { start: "2031-02-20", end: "2031-02-01" } } } });
  await plugin.ready;
  assert.equal(plugin.preferences.defaultRange, null);
  assert.equal(plugin.preferences.lastHistoryRange, null);
  const view = await open();
  assert.equal(view.state.range, 30);
});

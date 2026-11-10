const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const history = require("../src/history.js");
const analysis = require("../src/analysis.js");

test("folder history migrates, refreshes arbitrary notes, and retains creation dates after edits", async () => {
  class Plugin {
    addSettingTab() {} registerView() {} addCommand() {} addRibbonIcon() {} registerEvent() {}
    async loadData() { return { version: 2, customFolder: "Journal", entries: [] }; }
    async saveData(data) { this.saved = data; }
  }
  const sandbox = {
    module: { exports: {} }, analysis, history, dashboard: {}, setTimeout, clearTimeout,
    require: () => ({ Plugin, ItemView: class {}, PluginSettingTab: class {}, Setting: class {},
      moment: (value) => ({ isValid: () => /^2026-11-\d\d$/.test(value), format: () => value }),
      normalizePath: (value) => value, getFrontMatterInfo: () => ({ contentStart: 0 }) }),
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/plugin.js"), "utf8"), sandbox);
  const plugin = new sandbox.module.exports();
  const file = { path: "Journal/nested/My thoughts.md", extension: "md", stat: { ctime: new Date(2026, 10, 3, 12).getTime(), mtime: 1, size: 5 } };
  plugin.app = {
    workspace: { on() {}, onLayoutReady() {} },
    vault: { configDir: ".obsidian", on() {}, getMarkdownFiles: () => [file],
      getAbstractFileByPath: (path) => path === file.path ? file : null,
      cachedRead: async () => "I feel happy",
      adapter: { exists: async () => true, read: async () => JSON.stringify({ folder: "Daily", format: "YYYY-MM-DD" }) } },
  };
  plugin.onload();
  await plugin.ready;
  assert.equal(plugin.customFolders[0], "Journal");
  await plugin.applyFolderChange();
  assert.equal(plugin.records.get(file.path).date, "2026-11-03");
  assert.equal(plugin.saved.version, 3);
  file.stat.mtime = 9000;
  await plugin.updatePaths([file.path]);
  assert.equal(plugin.records.get(file.path).date, "2026-11-03");
  assert.equal(plugin.records.get(file.path).ctime, file.stat.ctime);
  plugin.preferences.dateFormat = "DD-MM-YYYY";
  assert.equal((await plugin.dailySettings()).format, "DD-MM-YYYY");
  plugin.preferences.includeSubfolders = false;
  await plugin.applyFolderChange();
  assert.equal(plugin.records.size, 0);
  plugin.preferences.includeSubfolders = true;
  await plugin.applyFolderChange();
  assert.equal(plugin.records.size, 1);
  plugin.customFolders = [];
  await plugin.applyFolderChange();
  assert.equal(plugin.records.size, 0);
  assert.equal(plugin.saved.preferences.dateFormat, "DD-MM-YYYY");
  plugin.onunload();
});

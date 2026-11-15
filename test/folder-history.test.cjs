const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const history = require("../src/history.js");
const analysis = require("../src/analysis.js");
const settings = require("../src/settings.js");

test("folder history migrates, refreshes arbitrary notes, and retains creation dates after edits", async () => {
  class Plugin {
    addSettingTab(tab) { this.tab = tab; } registerView() {} addCommand() {} addRibbonIcon() {} registerEvent() {}
    async loadData() { return { version: 2, customFolder: "Journal", entries: [] }; }
    async saveData(data) { this.saved = data; }
  }
  const sandbox = {
    module: { exports: {} }, analysis, history, settings, dashboard: {}, setTimeout, clearTimeout,
    require: () => ({ Plugin, ItemView: class {}, PluginSettingTab: class {}, Setting: class {},
      moment: (value) => ({ isValid: () => /^2026-11-\d\d$/.test(value), format: () => value }),
      normalizePath: (value) => value, getFrontMatterInfo: () => ({ contentStart: 0 }) }),
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/plugin.js"), "utf8"), sandbox);
  const plugin = new sandbox.module.exports();
  const file = { path: "Journal/nested/My thoughts.md", extension: "md", stat: { ctime: new Date(2026, 10, 3, 12).getTime(), mtime: 1, size: 5 } };
  plugin.app = {
    workspace: { on() {}, onLayoutReady() {}, getActiveViewOfType: () => null },
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
  file.path = "Journal/2026-11-07.md";
  plugin.preferences.dateFormat = "";
  plugin.folderDateRules.Journal = { source: "filename", format: "YYYY-MM-DD" };
  await plugin.applyFolderChange();
  assert.equal(plugin.records.get(file.path).date, "2026-11-07");
  assert.equal(plugin.saved.folderDateRules.Journal.source, "filename");
  plugin.folderDateRules.Journal.source = "creation";
  await plugin.applyFolderChange();
  assert.equal(plugin.records.get(file.path).date, "2026-11-03");
  plugin.preferences.dateFormat = "DD-MM-YYYY";
  plugin.customFolders = [];
  await plugin.applyFolderChange();
  assert.equal(plugin.records.size, 0);
  assert.equal(plugin.saved.preferences.dateFormat, "DD-MM-YYYY");
  plugin.customFolders = ["Journal"];
  plugin.folderDateRules.Journal = { source: "creation" };
  await plugin.applyFolderChange();
  assert.equal(plugin.records.get(file.path).topics.work, 0);
  plugin.preferences.customWords = { topics: { work: "happy" } };
  await plugin.applyAnalysisSettings();
  assert.equal(plugin.records.get(file.path).topics.work, 1);
  plugin.preferences.customWords = {};
  await plugin.applyAnalysisSettings();
  assert.equal(plugin.records.get(file.path).topics.work, 0);
  plugin.preferences.customWords = { topics: { work: "happy" } };
  plugin.preferences.wordListOverrides = { feelings: { joy: "" } };
  await plugin.applyAnalysisSettings();
  await plugin.inspect(file);
  assert.equal(plugin.records.get(file.path).feelings.joy, 0);
  assert.equal(plugin.records.get(file.path).topics.work, 1);
  assert.equal(plugin.live.stats.feelings.joy, 0);
  assert.equal(plugin.saved.preferences.wordListOverrides.feelings.joy, "");
  const persisted = JSON.parse(JSON.stringify(plugin.saved));
  plugin.onunload();
  const restarted = new sandbox.module.exports();
  restarted.app = plugin.app;
  restarted.loadData = async () => persisted;
  restarted.onload();
  await restarted.ready;
  assert.equal(restarted.preferences.wordListOverrides.feelings.joy, "");
  await restarted.inspect(file);
  assert.equal(restarted.live.stats.feelings.joy, 0);
  delete restarted.preferences.wordListOverrides.feelings.joy;
  await restarted.applyAnalysisSettings();
  assert.equal(restarted.records.get(file.path).feelings.joy, 1);
  assert.equal(restarted.records.get(file.path).topics.work, 1);
  assert.equal(restarted.live.stats.feelings.joy, 1);
  const save = restarted.saveData.bind(restarted);
  let writes = 0;
  restarted.saveData = async data => {
    if (++writes === 1) throw new Error("temporary storage failure");
    await save(data);
  };
  await restarted.persist();
  assert.match(restarted.status, /could not be saved/);
  await restarted.refreshHistory();
  assert.equal(writes, 2, "refresh retries a failed cache write even with unchanged notes");
  restarted.onunload();
});

test("excluded folders remove cached, live, daily and nested notes from all history aggregates", async () => {
  class Plugin {
    addSettingTab() {} registerView() {} addCommand() {} addRibbonIcon() {} registerEvent() {}
    async loadData() { return { customFolders: ["Journal", "Journal Extra"], entries: [] }; }
    async saveData(data) { this.saved = data; }
  }
  const sandbox = { module: { exports: {} }, analysis, history, settings, dashboard: {}, setTimeout, clearTimeout,
    require: () => ({ Plugin, ItemView: class {}, PluginSettingTab: class {}, Setting: class {},
      moment: require("moment"), normalizePath: value => value, getFrontMatterInfo: () => ({ contentStart: 0 }) }) };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/plugin.js"), "utf8"), sandbox);
  const make = (path, text) => ({ path, basename: path.split("/").at(-1).replace(/\.md$/, ""), extension: "md", text,
    stat: { ctime: new Date(2026, 10, 3, 12).getTime(), mtime: 1, size: text.length } });
  const files = [
    make("Daily/2026-11-03.md", "happy privateword work"),
    make("Journal/Private/nested/day.md", "sad secretword money"),
    make("Journal/Public/day.md", "happy publicword work"),
    make("Journal Extra/day.md", "joy siblingword family")
  ];
  const reads = [];
  const plugin = new sandbox.module.exports();
  plugin.app = { workspace: { on() {}, onLayoutReady() {}, getActiveViewOfType: () => null },
    vault: { configDir: ".obsidian", on() {}, getMarkdownFiles: () => files,
      getAbstractFileByPath: path => files.find(file => file.path === path),
      cachedRead: async file => { reads.push(file.path); return file.text; },
      adapter: { exists: async () => true, read: async () => JSON.stringify({ folder: "Daily", format: "YYYY-MM-DD" }) } } };
  plugin.onload(); await plugin.ready; await plugin.refreshHistory();
  assert.equal(plugin.records.size, 4);
  let draws = 0; plugin.historyViews.add({ draw: () => draws++, disposeCharts() {} });
  plugin.preferences.excludedFolders = ["Daily", "Journal/Private"];
  await plugin.applyFolderChange();
  assert(draws > 0, "changing exclusions redraws open history");
  assert.deepEqual([...plugin.records.keys()].sort(), ["Journal Extra/day.md", "Journal/Public/day.md"]);
  const days = history.groupDays(plugin.records.values());
  const totals = history.summarizeDays(days, "2026-11-03");
  assert.equal(totals.words, 6);
  assert.equal(totals.feelings.sadness, 0);
  assert.equal(totals.feelings.joy, 2);
  assert.equal(totals.topics.money, 0);
  assert.equal(totals.topics.work, 1);
  const vocab = await plugin.vocabulary({ start: "2026-11-03", end: "2026-11-03", days });
  assert(!vocab.counts.has("privateword") && !vocab.counts.has("secretword"));
  assert(vocab.counts.has("publicword") && vocab.counts.has("siblingword"));
  const before = reads.length;
  await plugin.updatePaths([files[0].path, files[1].path]);
  await plugin.inspect(files[1]);
  assert.equal(reads.length, before, "excluded files are not indexed or live analyzed");
  assert.equal(plugin.live.message, "This note is in an excluded folder.");
  assert(!plugin.live.stats);
  assert.deepEqual(JSON.parse(JSON.stringify(plugin.saved.preferences.excludedFolders)), ["Daily", "Journal/Private"]);
  const persisted = JSON.parse(JSON.stringify(plugin.saved));
  // A stale cached entry is filtered as soon as preferences are loaded.
  persisted.entries.push({ path: files[1].path, date: "2026-11-03", words: 99 });
  const restarted = new sandbox.module.exports(); restarted.app = plugin.app; restarted.loadData = async () => persisted;
  restarted.onload(); await restarted.ready;
  assert(!restarted.records.has(files[1].path));
  restarted.preferences.excludedFolders = [];
  await restarted.applyFolderChange();
  assert.equal(restarted.records.size, 4, "removing an exclusion restores indexing");
  // Exclusion changes while a read is in flight must not publish live stats.
  let finishRead, readStarted;
  const started = new Promise(resolve => { readStarted = resolve; });
  restarted.app.vault.cachedRead = () => { readStarted(); return new Promise(resolve => { finishRead = resolve; }); };
  const inspection = restarted.inspect(files[2]);
  await started;
  restarted.preferences.excludedFolders = ["Journal/Public"];
  finishRead(files[2].text);
  await inspection;
  assert.equal(restarted.live.message, "This note is in an excluded folder.");
  assert(!restarted.live.stats, "in-flight reads cannot restore excluded statistics");
  restarted.onunload(); plugin.onunload();
});

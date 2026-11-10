const { ItemView, MarkdownView, Plugin, PluginSettingTab, Setting, getFrontMatterInfo, moment, normalizePath } = require("obsidian");
const { analyzeWriting, keywordCounts } = analysis;
const { CACHE_VERSION, includedDate, normalizeFolders, recordStats, loadRecords, combineKeywords } = history;
const { renderStats, renderHistory, renderVocabulary } = dashboard;

const STATS_VIEW = "morning-pages-analytics";
const HISTORY_VIEW = "morning-pages-history";
const DEFAULT_DAILY = { folder: "", format: "YYYY-MM-DD", template: "" };

function noteBody(markdown) {
  return markdown.slice(getFrontMatterInfo(markdown).contentStart);
}

class WritingStatsView extends ItemView {
  constructor(leaf, plugin) { super(leaf); this.plugin = plugin; }
  getViewType() { return STATS_VIEW; }
  getDisplayText() { return "Writing stats"; }
  getIcon() { return "bar-chart-3"; }

  async onOpen() {
    this.plugin.statsViews.add(this);
    this.draw();
    await this.plugin.inspect(this.app.workspace.getActiveFile());
  }

  async onClose() {
    this.plugin.statsViews.delete(this);
    this.contentEl.replaceChildren();
  }

  draw() {
    renderStats(this.contentEl, this.plugin.live, () => void this.plugin.openView(HISTORY_VIEW));
  }
}

class WritingHistoryView extends ItemView {
  state = { range: 30, signal: "feelings", composition: "feelings", day: null, month: null };
  disposeCharts = () => {};
  drawVersion = 0;

  constructor(leaf, plugin) { super(leaf); this.plugin = plugin; }
  getViewType() { return HISTORY_VIEW; }
  getDisplayText() { return "Writing history"; }
  getIcon() { return "calendar-days"; }

  async onOpen() {
    this.plugin.historyViews.add(this);
    await this.plugin.ready;
    this.state.range = this.plugin.preferences.defaultRange;
    this.draw();
  }

  async onClose() {
    this.disposeCharts();
    this.plugin.historyViews.delete(this);
    this.contentEl.replaceChildren();
  }

  draw() {
    const scrollTop = this.contentEl.scrollTop;
    const drawVersion = ++this.drawVersion;
    this.disposeCharts();
    this.disposeCharts = renderHistory(this.contentEl, {
      entries: this.plugin.records.values(),
      today: moment().format("YYYY-MM-DD"),
      loading: Boolean(this.plugin.refreshing),
      status: this.plugin.status,
      noteOrder: this.plugin.preferences.noteOrder,
    }, this.state, {
      refresh: () => void this.plugin.refreshHistory(true),
      words: (period, previous, target) => void this.showWords(period, previous, target, drawVersion),
      change: (update, selector) => {
        Object.assign(this.state, update);
        this.draw();
        if (selector) {
          let control = this.contentEl.querySelector(selector);
          if (control?.disabled && control.closest(".mpa-calendar-header")) {
            const header = control.closest(".mpa-calendar-header");
            control = header.querySelector("button:not(:disabled)") ?? header;
          }
          control?.focus({ preventScroll: true });
        }
      },
      openNote: (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file?.extension === "md") void this.app.workspace.getLeaf(true).openFile(file);
      },
    });
    this.contentEl.scrollTop = scrollTop;
  }

  async showWords(period, previous, target, drawVersion) {
    const [current, baseline] = await Promise.all([
      this.plugin.vocabulary(period), previous?.days.length ? this.plugin.vocabulary(previous) : null,
    ]);
    if (!target.isConnected || drawVersion !== this.drawVersion) return;
    if (this.renderedWords?.target === target && this.renderedWords.current === current && this.renderedWords.baseline === baseline) return;

    // A cloud above the viewport can change height after the async read. Keep
    // the calendar at the same screen position, using the current scroll
    // position rather than one captured before the user had time to scroll.
    const lower = this.contentEl.querySelector(".mpa-history-lower");
    const anchor = lower && target.getBoundingClientRect().top < this.contentEl.getBoundingClientRect().top ? lower : null;
    const before = anchor?.getBoundingClientRect().top;
    renderVocabulary(target, current, baseline);
    target.style.minHeight = "";
    if (anchor) this.contentEl.scrollTop += anchor.getBoundingClientRect().top - before;
    this.renderedWords = { target, current, baseline };
  }
}

class MorningPagesSettingsTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    this.containerEl.empty();
    new Setting(this.containerEl).setName("Daily Notes filename format")
      .setDesc("Leave blank to use Obsidian's Daily Notes format. For example: YYYY-MM-DD or DD-MM-YYYY. This only affects Daily Notes; additional folders use creation dates.")
      .addText((text) => text.setPlaceholder("Use Daily Notes settings").setValue(this.plugin.preferences.dateFormat).onChange((value) => {
        this.plugin.preferences.dateFormat = value.trim();
        this.plugin.scheduleFolderRefresh();
      }));
    new Setting(this.containerEl).setName("Include subfolders")
      .setDesc("Track notes inside nested folders of the additional writing folders.")
      .addToggle((toggle) => toggle.setValue(this.plugin.preferences.includeSubfolders).onChange(async (value) => {
        this.plugin.preferences.includeSubfolders = value;
        await this.plugin.applyFolderChange();
      }));
    new Setting(this.containerEl).setName("Default history range")
      .setDesc("The date range shown when opening writing history.")
      .addDropdown((dropdown) => dropdown.addOptions({ "7": "7 days", "30": "30 days", "90": "90 days", "365": "1 year", "0": "All dates" })
        .setValue(String(this.plugin.preferences.defaultRange)).onChange(async (value) => {
          this.plugin.preferences.defaultRange = Number(value);
          await this.plugin.persist();
          for (const view of this.plugin.historyViews) { view.state.range = Number(value); view.state.rangeChosen = true; view.state.day = null; view.state.month = null; }
          this.plugin.drawHistory();
        }));
    new Setting(this.containerEl).setName("Note order within a day")
      .setDesc("Sort by creation time. Editing a note does not change its position or date.")
      .addDropdown((dropdown) => dropdown.addOptions({ newest: "Newest created first", oldest: "Oldest created first" })
        .setValue(this.plugin.preferences.noteOrder).onChange(async (value) => {
          this.plugin.preferences.noteOrder = value;
          await this.plugin.persist();
          this.plugin.drawHistory();
        }));
    new Setting(this.containerEl).setName("Additional writing folders")
      .setDesc("Track notes with any filename by their creation date. Includes subfolders and refreshes automatically. Daily Notes keep their filename dates.")
      .addButton((button) => button.setButtonText("Add folder").onClick(async () => {
        await this.plugin.ready;
        this.plugin.customFolders.push("");
        this.display();
      }));
    this.plugin.customFolders.forEach((folder, index) => {
      new Setting(this.containerEl).setName(`Folder ${index + 1}`)
        .addText((text) => text.setPlaceholder("Journal/Morning Pages").setValue(folder).onChange(async (value) => {
          await this.plugin.ready;
          this.plugin.customFolders[index] = value;
          this.plugin.scheduleFolderRefresh();
        }))
        .addButton((button) => button.setButtonText("Remove").onClick(async () => {
          await this.plugin.ready;
          clearTimeout(this.plugin.folderTimer);
          this.plugin.customFolders.splice(index, 1);
          await this.plugin.applyFolderChange();
          this.display();
        }));
    });
  }
}

module.exports = class MorningPagesAnalytics extends Plugin {
  statsViews = new Set();
  historyViews = new Set();
  records = new Map();
  dirty = new Set();
  vocabularyCache = new Map();
  live = {};
  daily = DEFAULT_DAILY;
  customFolders = [];
  preferences = { dateFormat: "", includeSubfolders: true, defaultRange: 30, noteOrder: "newest" };
  folderTimer = null;
  activeFile = null;
  revision = 0;
  status = "";
  writeTail = Promise.resolve();

  onload() {
    const { workspace, vault } = this.app;
    this.ready = this.loadData().then((data) => {
      this.records = loadRecords(data);
      this.customFolders = normalizeFolders(data?.customFolders ?? data?.customFolder ?? []);
      const saved = data?.preferences || {};
      this.preferences = {
        dateFormat: typeof saved.dateFormat === "string" ? saved.dateFormat.trim() : "",
        includeSubfolders: saved.includeSubfolders !== false,
        defaultRange: [0, 7, 30, 90, 365].includes(saved.defaultRange) ? saved.defaultRange : 30,
        noteOrder: saved.noteOrder === "oldest" ? "oldest" : "newest",
      };
    }, () => {});
    this.addSettingTab(new MorningPagesSettingsTab(this.app, this));
    this.registerView(STATS_VIEW, (leaf) => new WritingStatsView(leaf, this));
    this.registerView(HISTORY_VIEW, (leaf) => new WritingHistoryView(leaf, this));
    this.addCommand({ id: "open-stats", name: "Open writing stats", callback: () => void this.openView(STATS_VIEW) });
    this.addCommand({ id: "open-history", name: "Open writing history", callback: () => void this.openView(HISTORY_VIEW) });
    this.addCommand({ id: "refresh-history", name: "Refresh daily history", callback: () => void this.refreshHistory(true) });
    this.addRibbonIcon("bar-chart-3", "Open writing stats", () => void this.openView(STATS_VIEW));

    this.registerEvent(workspace.on("file-open", (file) => {
      if (file && this.statsViews.size) void this.inspect(file);
    }));
    this.registerEvent(workspace.on("editor-change", (editor, view) => {
      if (!this.statsViews.size || !view?.file || view.file !== this.activeFile) return;
      this.recordEdit();
      clearTimeout(this.statsTimer);
      this.statsTimer = setTimeout(() => void this.inspect(view.file, editor), 110);
    }));
    this.registerEvent(vault.on("create", (file) => this.queue(file.path)));
    this.registerEvent(vault.on("modify", (file) => {
      if (file === this.activeFile && this.statsViews.size) void this.inspect(file);
      if (includedDate(file, this.daily, this.customFolders, moment, this.preferences.includeSubfolders)) this.queue(file.path);
    }));
    this.registerEvent(vault.on("delete", (file) => {
      if (file === this.activeFile) void this.inspect(null);
      if (file.extension === "md") this.queue(file.path);
      else if (Array.isArray(file.children)) void this.refreshHistory();
    }));
    this.registerEvent(vault.on("rename", (file, oldPath) => {
      if (file === this.activeFile && this.statsViews.size) void this.inspect(file);
      if (file.extension === "md") {
        this.queue(oldPath);
        this.queue(file.path);
      } else if (Array.isArray(file.children)) void this.refreshHistory();
    }));
    workspace.onLayoutReady(() => { if (!this.stopped) void this.refreshHistory(); });
  }

  onunload() {
    this.stopped = true;
    this.revision++;
    clearTimeout(this.statsTimer);
    clearTimeout(this.historyTimer);
    clearTimeout(this.folderTimer);
    for (const view of this.historyViews) view.disposeCharts();
  }

  async openView(type) {
    const workspace = this.app.workspace;
    const file = workspace.getActiveFile();
    let leaf = workspace.getLeavesOfType(type)[0];
    if (!leaf) {
      leaf = (type === STATS_VIEW ? workspace.getRightLeaf(false) : null) ?? workspace.getLeaf(true);
      await leaf.setViewState({ type });
    }
    await workspace.revealLeaf(leaf);
    if (type === STATS_VIEW && file) await this.inspect(file);
    if (type === HISTORY_VIEW) void this.refreshHistory();
  }

  async inspect(file, editor) {
    clearTimeout(this.statsTimer);
    const revision = ++this.revision;
    if (this.activeFile !== file) this.editSession = null;
    this.activeFile = file?.extension === "md" ? file : null;
    if (!this.activeFile) {
      this.live = {};
      this.drawStats();
      return;
    }
    if (this.live.name !== file.basename) {
      this.live = { name: file.basename, message: "Reading note…" };
      this.drawStats();
    }
    try {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      const activeEditor = view?.file === file && view.getMode() === "source" ? view.editor : null;
      const text = (editor ?? activeEditor)?.getValue() ?? await this.app.vault.cachedRead(file);
      if (revision !== this.revision) return;
      const stats = analyzeWriting(noteBody(text));
      if (editor && this.editSession) this.editSession.current = stats.words;
      const session = this.editSession;
      const pace = session?.activeMs >= 3000 && session.current > session.start
        ? { minutes: session.activeMs / 60000, wordsPerMinute: (session.current - session.start) * 60000 / session.activeMs }
        : null;
      this.live = { name: file.basename, date: includedDate(file, this.daily, this.customFolders, moment, this.preferences.includeSubfolders), stats, pace };
    } catch {
      if (revision !== this.revision) return;
      this.live = { name: file.basename, message: "Could not read the open note." };
    }
    this.drawStats();
  }

  drawStats() { for (const view of this.statsViews) view.draw(); }
  drawHistory() { for (const view of this.historyViews) view.draw(); }

  recordEdit() {
    const now = Date.now();
    const session = this.editSession;
    if (!session || now - session.latest > 30000) {
      const words = this.live.stats?.words ?? 0;
      this.editSession = { latest: now, activeMs: 0, start: words, current: words };
    } else {
      session.activeMs += Math.max(0, now - session.latest);
      session.latest = now;
    }
  }

  async dailySettings() {
    const vault = this.app.vault;
    const configPath = `${vault.configDir}/daily-notes.json`;
    const config = await vault.adapter.exists(configPath) ? JSON.parse(await vault.adapter.read(configPath)) : DEFAULT_DAILY;
    const path = (value) => typeof value === "string" && value.trim().replace(/^\/+|\/+$/g, "") ? normalizePath(value.trim()) : "";
    const template = path(config?.template);
    return { folder: path(config?.folder), format: this.preferences.dateFormat || config?.format?.trim() || DEFAULT_DAILY.format, template: template && !template.endsWith(".md") ? `${template}.md` : template };
  }

  refreshHistory(force = false) {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.rebuildHistory(force).catch(() => {
      this.status = "Could not read Daily Notes settings. Refresh to retry.";
    }).finally(() => {
      this.refreshing = null;
      if (!this.stopped) {
        this.drawHistory();
        if (this.dirty.size) this.queue();
      }
    });
    this.drawHistory();
    return this.refreshing;
  }

  scheduleFolderRefresh() {
    clearTimeout(this.folderTimer);
    void this.persist();
    this.folderTimer = setTimeout(() => void this.applyFolderChange(), 450);
  }

  async applyFolderChange() {
    await this.persist();
    if (this.refreshing) await this.refreshing;
    if (!this.stopped) await this.refreshHistory();
  }

  async rebuildHistory(force) {
    await this.ready;
    if (this.flushing) await this.flushing;
    this.daily = await this.dailySettings();
    const candidates = this.app.vault.getMarkdownFiles().map((file) => [file, includedDate(file, this.daily, this.customFolders, moment, this.preferences.includeSubfolders)]).filter(([, date]) => date);
    const eligible = new Set(candidates.map(([file]) => file.path));
    let changed = false;
    let failed = 0;
    for (const path of this.records.keys()) {
      if (!eligible.has(path)) changed = this.records.delete(path) || changed;
    }
    for (let index = 0; index < candidates.length && !this.stopped; index += 8) {
      const results = await Promise.allSettled(candidates.slice(index, index + 8).map(([file, date]) => this.indexFile(file, date, force)));
      for (const result of results) {
        if (result.status === "fulfilled") changed = result.value || changed;
        else failed++;
      }
    }
    if (this.stopped) return;
    this.status = failed ? `${failed} daily ${failed === 1 ? "note could" : "notes could"} not be read.` : "";
    if (changed) await this.persist();
    if (this.activeFile && this.statsViews.size) void this.inspect(this.activeFile);
  }

  async indexFile(file, date, force) {
    const path = file.path;
    const { ctime, mtime, size } = file.stat;
    const before = this.records.get(path);
    if (!force && before?.ctime === ctime && before.mtime === mtime && before.size === size && before.date === date) return false;
    const text = await this.app.vault.cachedRead(file);
    if (this.stopped || this.app.vault.getAbstractFileByPath(path) !== file || file.stat.mtime !== mtime || file.stat.size !== size) return false;
    this.records.set(path, { path, date, ctime, mtime, size, ...recordStats(analyzeWriting(noteBody(text))) });
    return true;
  }

  queue(path) {
    if (path) this.dirty.add(path);
    clearTimeout(this.historyTimer);
    this.historyTimer = setTimeout(() => this.flush(), 220);
  }

  flush() {
    if (this.refreshing || this.flushing || this.stopped) return;
    const paths = [...this.dirty];
    this.dirty.clear();
    this.flushing = this.updatePaths(paths).finally(() => {
      this.flushing = null;
      if (!this.stopped) {
        this.drawHistory();
        if (this.dirty.size) this.queue();
      }
    });
  }

  async updatePaths(paths) {
    await this.ready;
    const results = await Promise.allSettled(paths.map((path) => {
      const file = this.app.vault.getAbstractFileByPath(path);
      const date = includedDate(file, this.daily, this.customFolders, moment, this.preferences.includeSubfolders);
      return date ? this.indexFile(file, date, true) : this.records.delete(path);
    }));
    if (results.some((result) => result.status === "rejected")) this.status = "Some daily notes could not be read. Refresh to retry.";
    if (!this.stopped && results.some((result) => result.status === "fulfilled" && result.value)) await this.persist();
  }

  async persist() {
    this.vocabularyCache.clear();
    const data = { version: CACHE_VERSION, preferences: { ...this.preferences }, customFolders: normalizeFolders(this.customFolders), entries: [...this.records.values()].sort((a, b) => a.path.localeCompare(b.path)) };
    this.writeTail = this.writeTail.catch(() => {}).then(() => this.saveData(data));
    try {
      await this.writeTail;
    } catch {
      this.status = "The history cache could not be saved. Refresh to retry.";
    }
  }

  vocabulary(period) {
    const key = `${period.start}/${period.end}`;
    if (this.vocabularyCache.has(key)) return this.vocabularyCache.get(key);
    const result = this.collectVocabulary(period.days.flatMap((day) => day.entries));
    this.vocabularyCache.set(key, result);
    if (this.vocabularyCache.size > 4) this.vocabularyCache.delete(this.vocabularyCache.keys().next().value);
    return result;
  }

  async collectVocabulary(entries) {
    const counts = new Map();
    let words = 0;
    let missing = 0;
    for (let index = 0; index < entries.length && !this.stopped; index += 8) {
      const results = await Promise.allSettled(entries.slice(index, index + 8).map(async (entry) => {
        const file = this.app.vault.getAbstractFileByPath(entry.path);
        if (!file || file.stat.mtime !== entry.mtime || file.stat.size !== entry.size) return false;
        const text = await this.app.vault.cachedRead(file);
        if (file.stat.mtime !== entry.mtime || file.stat.size !== entry.size) return false;
        combineKeywords(counts, keywordCounts(noteBody(text)));
        words += entry.words;
        return true;
      }));
      missing += results.filter((result) => result.status === "rejected" || !result.value).length;
    }
    return { counts, words, missing };
  }
};

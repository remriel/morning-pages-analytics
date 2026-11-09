const { ItemView, MarkdownView, Plugin, getFrontMatterInfo } = require("obsidian");
const { WORD_GOAL, MAX_SNAPSHOT_SIZE, countWords, goalStatus, normalizeText, readStatsSnapshot } = snapshot;

const VIEW_TYPE = "morning-pages-analytics";
const formatNumber = new Intl.NumberFormat();

class MorningPagesView extends ItemView {
  file = null;
  noteText = null;
  reference = null;
  noteRevision = 0;
  importRevision = 0;

  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "Morning Pages Analytics"; }
  getIcon() { return "bar-chart-3"; }

  async onOpen() {
    const root = this.contentEl;
    root.empty();
    root.addClass("mpa-view");

    const goal = root.createDiv({ cls: "mpa-goal" });
    goal.createEl("h2", { text: "Morning Pages Analytics" });
    this.noteName = goal.createDiv({ cls: "mpa-note-name" });
    this.goalCount = goal.createDiv({ cls: "mpa-goal-count" });
    this.progress = goal.createEl("progress", { attr: { max: WORD_GOAL, value: 0, "aria-label": "Progress to 750 words" } });
    this.goalMessage = goal.createDiv({ cls: "mpa-goal-message", attr: { "aria-live": "polite" } });

    const reference = root.createDiv({ cls: "mpa-reference" });
    reference.createEl("h3", { text: "750 Words reference" });
    reference.createEl("p", { text: "Replay a saved Stats page and compare its entry with the open note. Analysis of new writing requires the 750 Words scoring rules." });
    const actions = reference.createDiv({ cls: "mpa-actions" });
    const load = actions.createEl("button", { text: "Load saved Stats HTML", cls: "mod-cta" });
    this.clear = actions.createEl("button", { text: "Clear reference" });
    this.clear.hidden = true;
    this.input = actions.createEl("input", { attr: { type: "file", accept: ".htm,.html,text/html" } });
    this.input.hidden = true;
    this.comparison = reference.createDiv({ cls: "mpa-comparison", attr: { "aria-live": "polite" } });
    this.report = reference.createDiv({ cls: "mpa-report" });

    this.registerDomEvent(load, "click", () => this.input.click());
    this.registerDomEvent(this.clear, "click", () => this.clearReference());
    this.registerDomEvent(this.input, "change", () => {
      const selected = this.input.files?.[0];
      this.input.value = "";
      if (selected) void this.loadReference(selected);
    });
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      if (file?.extension === "md") void this.track(file);
    }));
    this.registerEvent(this.app.workspace.on("editor-change", (editor, view) => {
      if (!this.file || view?.file !== this.file) return;
      this.noteRevision++;
      this.updateText(editor.getValue());
    }));
    this.registerEvent(this.app.vault.on("delete", (file) => {
      if (file === this.file) void this.track(null);
    }));
    this.registerEvent(this.app.vault.on("rename", (file) => {
      if (file === this.file) this.refreshGoal();
    }));

    await this.track(this.app.workspace.getActiveFile());
  }

  async onClose() {
    this.noteRevision++;
    this.importRevision++;
    this.noteText = null;
    this.reference = null;
    this.contentEl.empty();
  }

  async track(file) {
    this.file = file?.extension === "md" ? file : null;
    this.noteText = null;
    const revision = ++this.noteRevision;
    this.refreshGoal();
    if (!this.file) return;

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.file === file && view.getMode() === "source") {
      this.updateText(view.editor.getValue());
      return;
    }

    try {
      const text = await this.app.vault.cachedRead(file);
      if (revision === this.noteRevision) this.updateText(text);
    } catch {
      if (revision === this.noteRevision) this.goalMessage.setText("Could not read the open note.");
    }
  }

  updateText(markdown) {
    const { contentStart } = getFrontMatterInfo(markdown);
    this.noteText = normalizeText(markdown.slice(contentStart));
    this.refreshGoal();
  }

  refreshGoal() {
    const count = this.noteText === null ? 0 : countWords(this.noteText);
    const status = goalStatus(count);
    this.noteName.setText(this.file?.basename ?? "Active Markdown note");
    this.goalCount.setText(`${formatNumber.format(count)} / ${WORD_GOAL}`);
    this.progress.value = Math.min(count, WORD_GOAL);
    this.goalCount.classList.toggle("is-complete", status.complete);
    if (this.noteText === null) this.goalMessage.setText(this.file ? "Reading note…" : "Open a Markdown note to track your writing.");
    else if (status.complete) this.goalMessage.setText("750-word goal reached.");
    else this.goalMessage.setText(`${status.remaining} ${status.remaining === 1 ? "word" : "words"} to go.`);
    this.refreshComparison();
  }

  async loadReference(file) {
    const revision = ++this.importRevision;
    this.comparison.setText("Reading saved Stats page…");
    try {
      if (file.size > MAX_SNAPSHOT_SIZE) throw new Error("This Stats HTML exceeds the 12 MB import limit.");
      const text = await file.text();
      if (revision !== this.importRevision) return;

      const reference = readStatsSnapshot(text, this.report.ownerDocument);
      this.report.replaceChildren(reference.fragment);
      this.reference = reference;
      this.clear.hidden = false;
      this.refreshComparison();
    } catch (error) {
      if (revision !== this.importRevision) return;
      this.report.empty();
      this.reference = null;
      this.clear.hidden = false;
      this.comparison.setText(error instanceof Error ? error.message : "Could not read the Stats HTML file.");
    }
  }

  clearReference() {
    this.importRevision++;
    this.reference = null;
    this.report.empty();
    this.comparison.empty();
    this.clear.hidden = true;
  }

  refreshComparison() {
    if (!this.reference) return;

    const { referenceText, referenceWordCount } = this.reference;
    const count = referenceWordCount === null ? "Saved entry." : `${formatNumber.format(referenceWordCount)} words in the saved entry.`;
    if (referenceText === null || this.noteText === null) {
      this.comparison.setText(count);
      return;
    }
    const match = this.noteText === referenceText ? "The open note matches the saved entry text." : "The open note and the saved entry contain different text.";
    this.comparison.setText(`${count} ${match}`);
  }
}

module.exports = class MorningPagesAnalytics extends Plugin {
  onload() {
    this.registerView(VIEW_TYPE, (leaf) => new MorningPagesView(leaf));
    this.addCommand({
      id: "open-stats",
      name: "Open 750-word stats panel",
      callback: () => { void this.openStats(); },
    });
    this.addRibbonIcon("bar-chart-3", "Open Morning Pages Analytics", () => { void this.openStats(); });
  }

  async openStats() {
    const workspace = this.app.workspace;
    const file = workspace.getActiveFile();
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE });
    }
    if (leaf.view instanceof MorningPagesView && file) await leaf.view.track(file);
    await workspace.revealLeaf(leaf);
  }
};

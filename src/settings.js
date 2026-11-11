const { GROUPS } = require("./analysis.js");
const { DATE_FORMAT_PRESETS, normalizeFolderRule, normalizeFolders } = require("./history.js");

const SECTIONS = { writing: "Writing", words: "Word lists", history: "History", folders: "Folders" };
const GROUP_LABELS = { feelings: "Feelings", topics: "Topics", mindset: "Mindset", time: "Time orientation", senses: "Senses", pronouns: "Pronouns" };
const element = (parent, tag, className, text) => {
  const node = parent.ownerDocument.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  parent.appendChild(node);
  return node;
};
const labelInput = (input, label) => input.setAttribute("aria-label", label);

function createSettingsTab(PluginSettingTab, Setting) {
  return class MorningPagesSettingsTab extends PluginSettingTab {
    section = "writing";
    group = "topics";
    category = "work";
    expandedFolders = new Set([0]);
    draftRules = new Map();
    renderVersion = 0;

    constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }

    async display(focusSelector) {
      const version = ++this.renderVersion;
      await this.plugin.ready;
      if (version !== this.renderVersion) return;
      const root = this.containerEl;
      root.replaceChildren();
      root.classList.add("mpa-settings");
      const header = element(root, "header", "mpa-settings-header");
      element(header, "p", "mpa-settings-kicker", "YOUR WRITING, YOUR RULES");
      element(header, "h2", "", "Morning Pages Analytics");
      element(header, "p", "", "Choose your goal, tune the words that count, and organize your history. All analysis stays in your vault.");
      const nav = element(root, "nav", "mpa-settings-nav");
      nav.setAttribute("aria-label", "Morning Pages settings sections");
      for (const [key, title] of Object.entries(SECTIONS)) {
        const button = element(nav, "button", "mpa-settings-tab", title);
        button.type = "button";
        button.dataset.section = key;
        button.setAttribute("aria-pressed", String(key === this.section));
        button.addEventListener("click", () => {
          this.section = key;
          void this.display(`[data-section="${key}"]`);
        });
      }
      const panel = element(root, "section", "mpa-settings-panel");
      panel.setAttribute("aria-label", SECTIONS[this.section]);
      if (this.section === "writing") this.renderWriting(panel);
      if (this.section === "words") this.renderWords(panel);
      if (this.section === "history") this.renderHistory(panel);
      if (this.section === "folders") this.renderFolders(panel);
      if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: true });
    }

    heading(parent, title, description) {
      element(parent, "h3", "mpa-settings-title", title);
      element(parent, "p", "mpa-settings-help", description);
    }

    dropdownSetting(parent, name) {
      const setting = new Setting(parent).setName(name);
      setting.settingEl.classList.add("mpa-dropdown-setting");
      return setting;
    }

    renderWriting(panel) {
      this.heading(panel, "A goal that fits your day", "Your daily goal applies to the live tracker, calendar, completion totals and streaks. Changing it also recalculates past goal completion.");
      const message = element(panel, "p", "mpa-settings-status");
      message.setAttribute("role", "status");
      new Setting(panel).setName("Daily word goal").setDesc("Any positive whole number. The default is 750 words.")
        .addText((text) => {
          text.setValue(String(this.plugin.preferences.wordGoal));
          text.inputEl.type = "number";
          text.inputEl.min = "1";
          text.inputEl.step = "1";
          labelInput(text.inputEl, "Daily word goal");
          text.onChange(async (value) => {
            const goal = Number(value);
            const valid = /^\d+$/.test(value.trim()) && Number.isSafeInteger(goal) && goal > 0;
            text.inputEl.setAttribute("aria-invalid", String(!valid));
            text.inputEl.setCustomValidity(valid ? "" : "Enter a positive whole number.");
            message.textContent = valid ? "Saving goal…" : "Enter a whole number greater than zero, such as 100, 300 or 1000.";
            if (!valid) return;
            this.plugin.preferences.wordGoal = goal;
            await this.plugin.applyAnalysisSettings();
            message.textContent = "Goal saved. Your tracker and history are updated.";
          });
        });
      element(panel, "p", "mpa-settings-note", "Try 100 or 300 for a shorter session, 750 for traditional morning pages, or 1000 and above for a longer practice.");
    }

    scheduleWordRefresh() {
      void this.plugin.persist();
      clearTimeout(this.plugin.analysisTimer);
      const status = this.wordStatus;
      if (status) status.textContent = "Changes saved. Updating your note and history…";
      this.plugin.analysisTimer = setTimeout(async () => {
        await this.plugin.applyAnalysisSettings();
        if (status?.isConnected) status.textContent = this.plugin.status || "Saved. Your note and history now use these words.";
      }, 450);
    }

    renderWords(panel) {
      this.heading(panel, "Make the categories your own", "Choose a category to edit its base words or add extra words. Changes automatically update the active note and all tracked history.");
      this.dropdownSetting(panel, "Category group").addDropdown((dropdown) => {
        dropdown.addOptions(GROUP_LABELS).setValue(this.group);
        labelInput(dropdown.selectEl, "Category group");
        dropdown.onChange((value) => {
          this.group = value;
          this.category = GROUPS[value][0].key;
          void this.display('[aria-label="Category group"]');
        });
      });
      this.dropdownSetting(panel, "Category").addDropdown((dropdown) => {
        dropdown.addOptions(Object.fromEntries(GROUPS[this.group].map(({ key, label }) => [key, label]))).setValue(this.category);
        labelInput(dropdown.selectEl, "Category");
        dropdown.onChange((value) => { this.category = value; void this.display('[aria-label="Category"]'); });
      });
      const { group, category } = this;
      const item = GROUPS[group].find(({ key }) => key === category);
      const defaults = [...item.words].join(", ");
      const editor = element(panel, "div", "mpa-word-editor");
      element(editor, "h4", "", item.label);
      const override = this.plugin.preferences.wordListOverrides?.[group]?.[category];
      const badge = element(editor, "p", "mpa-word-list-state", typeof override === "string" ? "Customized base list" : "Using the built-in base list");
      const base = new Setting(editor).setName("Base word list")
        .setDesc("Edit, add or remove words here. Clearing this field disables the base words for this category. Extra words below still count.");
      base.settingEl.classList.add("mpa-word-field");
      base.addTextArea((text) => {
        text.setValue(typeof override === "string" ? override : defaults);
        text.inputEl.rows = 7;
        labelInput(text.inputEl, `${item.label} base word list`);
        text.onChange((value) => {
          const overrides = this.plugin.preferences.wordListOverrides ||= {};
          (overrides[group] ||= {})[category] = value;
          badge.textContent = "Customized base list";
          this.scheduleWordRefresh();
        });
      });
      new Setting(editor).setName("Restore built-in base list")
        .setDesc("Restores only this category's base words. Your extra words stay as they are.")
        .addButton((button) => button.setButtonText("Restore defaults").onClick(async () => {
          const overrides = this.plugin.preferences.wordListOverrides?.[group];
          if (overrides) {
            delete overrides[category];
            if (!Object.keys(overrides).length) delete this.plugin.preferences.wordListOverrides[group];
          }
          clearTimeout(this.plugin.analysisTimer);
          await this.plugin.applyAnalysisSettings();
          await this.display(`[aria-label="${item.label} base word list"]`);
        }));
      const extra = new Setting(editor).setName("Extra words")
        .setDesc("Optional additions, kept separately from the base list. Existing additions from earlier versions appear here.");
      extra.settingEl.classList.add("mpa-word-field");
      extra.addTextArea((text) => {
        text.setValue(this.plugin.preferences.customWords?.[group]?.[category] || "");
        text.setPlaceholder("For example: litigation, contract, contracts");
        text.inputEl.rows = 3;
        labelInput(text.inputEl, `${item.label} extra words`);
        text.onChange((value) => {
          const additions = this.plugin.preferences.customWords ||= {};
          (additions[group] ||= {})[category] = value;
          this.scheduleWordRefresh();
        });
      });
      element(editor, "p", "mpa-settings-note", "Separate words with commas, spaces or newlines. Matching ignores case and duplicate words. Include word forms separately, such as contract and contracts.");
      this.wordStatus = element(editor, "p", "mpa-settings-status", "Changes save automatically and are applied after you pause typing.");
      this.wordStatus.setAttribute("role", "status");
    }

    renderHistory(panel) {
      this.heading(panel, "Your history view", "Choose the opening date range and the order of notes within a day. Date sources for your folders are in Folders.");
      this.dropdownSetting(panel, "Default history range").setDesc("Applies when opening history, and updates any history view already open.")
        .addDropdown((dropdown) => {
          dropdown.addOptions({ "7": "7 days", "14": "14 days", "30": "30 days", "60": "60 days", "90": "90 days", "180": "180 days", "365": "1 year", "0": "All dates" }).setValue(String(this.plugin.preferences.defaultRange));
          labelInput(dropdown.selectEl, "Default history range");
          dropdown.onChange(async (value) => {
            this.plugin.preferences.defaultRange = Number(value);
            await this.plugin.persist();
            for (const view of this.plugin.historyViews) Object.assign(view.state, { range: Number(value), rangeOffset: 0, rangeChosen: true, day: null, month: null });
            this.plugin.drawHistory();
          });
        });
      this.dropdownSetting(panel, "Note order within a day").setDesc("Sort by creation time. Editing a note does not move it to a different day.")
        .addDropdown((dropdown) => {
          dropdown.addOptions({ newest: "Newest created first", oldest: "Oldest created first" }).setValue(this.plugin.preferences.noteOrder);
          labelInput(dropdown.selectEl, "Note order within a day");
          dropdown.onChange(async (value) => { this.plugin.preferences.noteOrder = value; await this.plugin.persist(); this.plugin.drawHistory(); });
        });
    }

    folderKey(index) { return normalizeFolders([this.plugin.customFolders[index]])[0] || ""; }
    folderRule(index) { return normalizeFolderRule(this.folderKey(index) ? this.plugin.folderDateRules[this.folderKey(index)] : this.draftRules.get(index)); }
    setFolderRule(index, rule) {
      if (this.folderKey(index)) this.plugin.folderDateRules[this.folderKey(index)] = rule;
      else this.draftRules.set(index, rule);
    }

    renderFolders(panel) {
      this.heading(panel, "Choose what goes into history", "Daily Notes are included automatically. Add other folders for journals, imported entries or notes with any title. Each folder can use its own date source.");
      const daily = element(panel, "div", "mpa-settings-card");
      element(daily, "h4", "", "Daily Notes · always included");
      new Setting(daily).setName("Daily Notes filename format").setDesc("Leave blank to follow Obsidian's Daily Notes settings. For example YYYY-MM-DD. This can also be inherited by your other folders.")
        .addText((text) => {
          text.setPlaceholder("Use Daily Notes settings").setValue(this.plugin.preferences.dateFormat);
          labelInput(text.inputEl, "Daily Notes filename format");
          text.onChange((value) => { this.plugin.preferences.dateFormat = value.trim(); this.plugin.scheduleFolderRefresh(); });
        });
      new Setting(panel).setName("Include subfolders").setDesc("Also track notes inside nested folders of your additional writing folders.")
        .addToggle((toggle) => toggle.setValue(this.plugin.preferences.includeSubfolders).onChange(async (value) => {
          this.plugin.preferences.includeSubfolders = value;
          await this.plugin.applyFolderChange();
        }));
      new Setting(panel).setName("Additional writing folders").setDesc("Expand a folder below to change its path or date source. Changes refresh history automatically.")
        .addButton((button) => button.setButtonText("Add folder").onClick(async () => {
          const index = this.plugin.customFolders.push("") - 1;
          this.expandedFolders.add(index);
          await this.display(`[data-folder-index="${index}"] input`);
        }));
      if (!this.plugin.customFolders.length) element(panel, "p", "mpa-settings-note", "Tracking Daily Notes only. Use Add folder to include more writing.");
      this.plugin.customFolders.forEach((folder, index) => this.renderFolder(panel, folder, index));
    }

    renderFolder(panel, folder, index) {
      const card = element(panel, "details", "mpa-settings-card mpa-folder-card");
      card.dataset.folderIndex = String(index);
      card.open = this.expandedFolders.has(index);
      const summary = element(card, "summary", "", folder || "New writing folder");
      card.addEventListener("toggle", () => { if (card.open) this.expandedFolders.add(index); else this.expandedFolders.delete(index); });
      const body = element(card, "div", "mpa-folder-body");
      const rule = this.folderRule(index);
      new Setting(body).setName(`Folder ${index + 1}`).setDesc("Path inside your vault, such as Ledger/Journal.")
        .addText((text) => {
          text.setPlaceholder("Journal/Morning Pages").setValue(folder);
          labelInput(text.inputEl, `Folder ${index + 1} path`);
          text.onChange((value) => {
            const previousRule = this.folderRule(index);
            this.plugin.customFolders[index] = value;
            this.setFolderRule(index, previousRule);
            summary.textContent = value.trim() || "New writing folder";
            this.plugin.scheduleFolderRefresh();
          });
        })
        .addButton((button) => button.setButtonText("Remove").onClick(async () => {
          clearTimeout(this.plugin.folderTimer);
          this.plugin.customFolders.splice(index, 1);
          this.expandedFolders = new Set([...this.expandedFolders].filter((i) => i !== index).map((i) => i > index ? i - 1 : i));
          this.draftRules = new Map([...this.draftRules].filter(([i]) => i !== index).map(([i, value]) => [i > index ? i - 1 : i, value]));
          await this.plugin.applyFolderChange();
          await this.display();
        }));
      this.dropdownSetting(body, `Folder ${index + 1} date source`).setDesc("Choose where the calendar date comes from. Filename modes skip missing or ambiguous dates; they never fall back to import timestamps.")
        .addDropdown((dropdown) => {
          dropdown.addOptions({ auto: "Automatic filename dates", filename: "Selected filename formats", creation: "Creation timestamp" }).setValue(rule.source);
          labelInput(dropdown.selectEl, `Folder ${index + 1} date source`);
          dropdown.onChange(async (source) => {
            this.setFolderRule(index, { ...this.folderRule(index), source });
            await this.plugin.applyFolderChange();
            await this.display(`[data-folder-index="${index}"] select`);
          });
        });
      if (rule.source === "creation") element(body, "p", "mpa-settings-note", "Any Markdown title is accepted. Notes are placed on their creation day; editing them does not change that day. Copying or importing files can reset their creation timestamp.");
      if (rule.source === "auto") new Setting(body).setName("Automatic date recognition")
        .setDesc(`Recognizes ${DATE_FORMAT_PRESETS.length} common formats plus Daily Notes, including September 13 2026. No formats to add. For ambiguous numeric dates, choose Selected filename formats to specify day-first or month-first.`);
      if (rule.source !== "filename") return;
      element(body, "p", "mpa-settings-help", "Enable as many formats as you need. Every enabled format is matched at the same time.");
      const choices = [["", "Use Daily Notes format"], ...DATE_FORMAT_PRESETS];
      const grid = element(body, "div", "mpa-format-grid");
      for (const [format, example] of choices) new Setting(grid).setName(example).setDesc(format || "Match the configured Daily Notes format.")
        .addToggle((toggle) => toggle.setValue(rule.formats.includes(format)).onChange(async (enabled) => {
          const current = this.folderRule(index);
          current.formats = enabled ? [...new Set([...current.formats, format])] : current.formats.filter((value) => value !== format);
          this.setFolderRule(index, current);
          await this.plugin.applyFolderChange();
        }));
      const presets = new Set(choices.map(([format]) => format));
      const custom = new Setting(body).setName("Other filename formats").setDesc("Optional custom formats, one per line. If no formats are enabled, no titles match.");
      custom.settingEl.classList.add("mpa-word-field");
      custom.addTextArea((text) => {
        text.setPlaceholder("YYYY/MM/DD").setValue(rule.formats.filter((format) => !presets.has(format)).join("\n"));
        labelInput(text.inputEl, `Folder ${index + 1} other filename formats`);
        text.onChange((value) => {
          const current = this.folderRule(index);
          current.formats = [...new Set([...current.formats.filter((format) => presets.has(format)), ...value.split(/\r?\n/).map((format) => format.trim()).filter(Boolean)])];
          this.setFolderRule(index, current);
          this.plugin.scheduleFolderRefresh();
        });
      });
    }
  };
}

module.exports = { createSettingsTab };

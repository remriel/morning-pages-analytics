const test = require("node:test");
const assert = require("node:assert/strict");
const { createSettingsTab } = require("../src/settings.js");

// A small Settings adapter exercises the real Folders section without Obsidian.
test("Excluded folders accepts one path per line and schedules a refresh", () => {
  const controls = new Map();
  const document = { createElement: () => ({ ownerDocument: document, children: [], dataset: {}, classList: { add() {} },
    appendChild(child) { this.children.push(child); child.parentElement = this; }, setAttribute() {} }) };
  class Setting {
    constructor(parent) { this.settingEl = document.createElement("div"); parent.appendChild(this.settingEl); }
    setName(name) { this.name = name; return this; } setDesc() { return this; }
    addText(callback) { return this.control(callback); } addTextArea(callback) { return this.control(callback); }
    control(callback) {
      const inputEl = document.createElement("input");
      const control = { inputEl, setValue(value) { this.value = value; return this; }, setPlaceholder() { return this; }, onChange(handler) { this.change = handler; return this; } };
      controls.set(this.name, control); callback(control); return this;
    }
    addToggle(callback) { const api = { setValue() { return this; }, onChange() { return this; } }; callback(api); return this; }
    addButton(callback) { const api = { setButtonText() { return this; }, onClick() { return this; } }; callback(api); return this; }
  }
  const plugin = { preferences: { dateFormat: "", includeSubfolders: true, excludedFolders: ["Old"] }, customFolders: [], folderDateRules: {}, scheduleFolderRefresh() { this.refreshed = (this.refreshed || 0) + 1; } };
  const Tab = createSettingsTab(class {}, Setting);
  const tab = new Tab({}, plugin);
  const panel = document.createElement("section");
  tab.renderFolders(panel);
  const input = controls.get("Excluded folders");
  assert(input); assert.equal(input.value, "Old");
  input.change(" /Journal/Private/ \nDaily/Archive\nJournal/Private\n\n");
  assert.deepEqual(plugin.preferences.excludedFolders, ["Journal/Private", "Daily/Archive"]);
  assert.equal(plugin.refreshed, 1);
});

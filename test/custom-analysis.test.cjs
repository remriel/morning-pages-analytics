const test = require("node:test");
const assert = require("node:assert/strict");
const { configureAnalysis, getWordGoal, analyzeWriting, normalizeWordListOverrides, GROUPS } = require("../src/analysis.js");
const { groupDays, summarizeDays, recordStats } = require("../src/history.js");

test("whole-number goals drive completion and streaks below and above 750", () => {
  const days = groupDays([100, 300, 1000].map((words, i) => ({ date: `2026-11-0${i + 1}`, ...recordStats({ words }) })));
  for (const [goal, completed, best] of [[1, 3, 3], [100, 3, 3], [300, 2, 2], [750, 1, 1], [1000, 1, 1], [2000, 0, 0]]) {
    configureAnalysis(goal);
    const result = summarizeDays(days, "2026-11-03");
    assert.equal(getWordGoal(), goal);
    assert.equal(result.goalDays, completed);
    assert.equal(result.best, best);
  }
  configureAnalysis(750);
});

test("custom words extend built-ins without double counting and support every category", () => {
  configureAnalysis(750, { topics: { work: "litigation, CONTRACT\nwork litigation" }, feelings: { joy: "jubilation" } });
  const stats = analyzeWriting("Work litigation litigation contract jubilation.");
  assert.equal(stats.topics.work, 4);
  assert.equal(stats.feelings.joy, 1);
  assert.equal(analyzeWriting("Work litigation", {}).topics.work, 1);
  configureAnalysis(750);
  assert.equal(analyzeWriting("Work litigation").topics.work, 1);
});

test("edited base lists replace built-ins, combine with additions and never mutate shipped defaults", () => {
  const originalWork = [...GROUPS.topics.find(({ key }) => key === "work").words];
  const overrides = { topics: { work: "CONTRACT, contract\nlitigation" } };
  const additions = { topics: { work: "contract subpoena" } };
  configureAnalysis(300, additions, overrides);
  assert.equal(analyzeWriting("work contract litigation subpoena").topics.work, 3);
  assert.equal(analyzeWriting("work contract litigation subpoena", additions, overrides).topics.work, 3);
  assert.deepEqual([...GROUPS.topics.find(({ key }) => key === "work").words], originalWork);
  assert.equal(analyzeWriting("work contract litigation subpoena", {}, {}).topics.work, 1);
  configureAnalysis(750);
  assert.equal(analyzeWriting("work contract litigation subpoena").topics.work, 1);
});

test("an empty base override disables defaults while retaining separately added words", () => {
  const persisted = JSON.parse(JSON.stringify({ topics: { work: "" } }));
  const restored = normalizeWordListOverrides(persisted);
  assert.equal(restored.topics.work, "");
  assert.equal(analyzeWriting("work client litigation", { topics: { work: "litigation" } }, restored).topics.work, 1);
  assert.equal(analyzeWriting("work client", {}, restored).topics.work, 0);
  assert.equal(analyzeWriting("work client", {}, {}).topics.work, 2);
  assert.deepEqual(normalizeWordListOverrides({ topics: { work: null, unknown: "secret" }, unknown: { x: "ignored" } }), {});
});

test("base lists can be overridden independently for every category", () => {
  for (const [name, categories] of Object.entries(GROUPS)) for (const { key, words } of categories) {
    const original = [...words][0];
    const overrides = { [name]: { [key]: "bespoketerm" } };
    assert.equal(analyzeWriting(`${original} bespoketerm bespoketerm`, {}, overrides)[name][key], 2, `${name}/${key}`);
    assert.equal(analyzeWriting(original, {}, { [name]: { [key]: "" } })[name][key], 0, `empty ${name}/${key}`);
  }
});

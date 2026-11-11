const test = require("node:test");
const assert = require("node:assert/strict");
const { configureAnalysis, getWordGoal, analyzeWriting } = require("../src/analysis.js");
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

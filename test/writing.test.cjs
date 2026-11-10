const test = require("node:test");
const assert = require("node:assert/strict");
const { analyzeWriting, keywordCounts, rankKeywords } = require("../src/analysis.js");
const { CACHE_VERSION, dailyDate, includedDate, recordStats, groupDays, historyWindow, previousWindow, summarizeDays, seriesBuckets, loadRecords, combineKeywords } = require("../src/history.js");

test("includes a custom folder alongside Daily Notes without matching sibling paths", () => {
  const settings = { folder: "Daily", format: "YYYY-MM-DD", template: "" };
  const moment = (value) => ({ isValid: () => /^2026-11-0[1-9]$/.test(value), format: () => value });
  const date = (path, custom = "Morning") => includedDate({ path, extension: "md" }, settings, custom, moment);
  assert.equal(date("Daily/2026-11-05.md"), "2026-11-05");
  assert.equal(date("Morning/2026-11-05.md"), "2026-11-05");
  assert.equal(date("Morning Extra/2026-11-05.md"), null);
  assert.equal(date("Morning/2026-11-05.md", ""), null);
});

test("counts prose and matched language without counting code, link targets, or embeds", () => {
  const stats = analyzeWriting("I feel grateful about [work](https://bad.test/project) and café.\n\nThe friend is sad. ![[Secret]]\n\n```js\nnegative anxious bad\n```\n`angry` <!-- tired -->");
  assert.equal(stats.words, 11);
  assert.equal(stats.paragraphs, 2);
  assert.equal(stats.sentences, 2);
  assert.equal(stats.positive, 1);
  assert.equal(stats.negative, 1);
  assert.equal(stats.topics.work, 1);
  assert.equal(stats.topics.people, 1);
  assert.equal(Object.hasOwn(recordStats(stats), "frequent"), false);
});

test("scores all visible breakdowns and adds note-level keyword counts for the selected period", () => {
  const first = analyzeWriting("I was anxious yesterday. We may grow tomorrow and hear music. Lantern lantern.");
  const second = analyzeWriting("We are happy and certain. I saw a bright lantern and tasted a sweet pear.");
  assert.deepEqual([first.feelings.anxiety, first.topics.growth, first.mindset.uncertain, first.time.future, first.senses.sound, first.pronouns.we], [1, 1, 1, 1, 2, 1]);
  assert.deepEqual([second.feelings.joy, second.mindset.certain, second.senses.sight, second.senses.taste], [1, 1, 2, 2]);
  const combined = new Map();
  combineKeywords(combined, first.keywords);
  combineKeywords(combined, second.keywords);
  combineKeywords(combined, keywordCounts("[Lantern](https://example.test/words) and the lantern"));
  assert.deepEqual(rankKeywords(combined, 1), [["lantern", 5]]);
  assert.equal(combined.has("and"), false);
  const record = recordStats(first);
  assert.equal(record.feelings.anxiety, 1);
  assert.equal(Object.hasOwn(record, "keywords"), false);
});

test("restricts Daily Notes matching to its configured folder, format, and template exclusion", () => {
  const settings = { folder: "Daily", format: "YYYY/MM/YYYY-MM-DD", template: "Daily/2026/11/2026-11-04.md" };
  const moment = (input, format, strict) => {
    assert.equal(format, settings.format);
    assert.equal(strict, true);
    return { isValid: () => /^\d{4}\/\d{2}\/\d{4}-\d{2}-\d{2}$/.test(input), format: (pattern) => pattern === format ? input : input.split("/").at(-1) };
  };
  const date = (path) => dailyDate({ path, extension: "md" }, settings, moment);
  assert.equal(date("Daily/2026/11/2026-11-05.md"), "2026-11-05");
  assert.equal(date("Daily/2026/02/2026-02-30.md"), null);
  assert.equal(date("Daily/2026/11/2026-11-04.md"), null);
  assert.equal(date("Daily Other/2026/11/2026-11-05.md"), null);
  assert.equal(date("Daily/2026-11-05.md"), null);
});

test("history groups same-day notes, respects gaps, and preserves totals across long-range buckets", () => {
  const entry = (date, words) => ({ date, ...recordStats({ words }) });
  const days = groupDays([entry("2026-10-30", 750), entry("2026-11-01", 700), entry("2026-11-01", 50), entry("2026-11-02", 751), entry("2026-11-04", 749)]);
  const summary = summarizeDays(days, "2026-11-03");
  assert.deepEqual([summary.words, summary.writingDays, summary.goalDays, summary.current, summary.best], [3000, 4, 3, 2, 2]);
  assert.equal(summarizeDays(days, "2026-11-04").current, 0);
  const window = historyWindow(days, "2026-11-09", 7);
  assert.deepEqual(window.days.map(({ date }) => date), ["2026-11-04"]);
  const year = seriesBuckets(historyWindow(days, "2026-11-09", 365));
  assert.equal(year.step, 7);
  assert.equal(year.buckets.reduce((sum, row) => sum + row.words, 0), 3000);
  const custom = historyWindow(days, "2026-11-09", "custom", { start: "2026-11-02", end: "2026-11-04" });
  assert.deepEqual(custom.days.map(({ date }) => date), ["2026-11-02", "2026-11-04"]);
  assert.deepEqual(previousWindow(days, custom).days.map(({ date }) => date), ["2026-10-30", "2026-11-01"]);
});

test("cache load validates records and strips transient vocabulary", () => {
  const records = loadRecords({ version: CACHE_VERSION, entries: [
    { path: "Daily/2026-11-09.md", date: "2026-11-09", mtime: 1, size: 4, words: 1, positive: -3, keywords: [["private", 1]] },
    { path: "bad.md", date: "2026-02-30", words: 1 },
  ] });
  assert.equal(records.size, 1);
  const item = records.get("Daily/2026-11-09.md");
  assert.equal(item.words, 1);
  assert.equal(item.positive, 0);
  assert.equal(Object.hasOwn(item, "keywords"), false);
  assert.equal(loadRecords({ version: 1, entries: [...records.values()] }).size, 0);
});

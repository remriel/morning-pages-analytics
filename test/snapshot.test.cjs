const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MAX_SNAPSHOT_SIZE,
  countWords,
  goalStatus,
  readStatsSnapshot,
} = require("../src/snapshot.js");

test("word goal boundary is exact at 749, 750, and 751 words", () => {
  assert.deepEqual(goalStatus(749), { remaining: 1, complete: false });
  assert.deepEqual(goalStatus(750), { remaining: 0, complete: true });
  assert.deepEqual(goalStatus(751), { remaining: 0, complete: true });
});

test("word count splits on whitespace, including NBSP, and counts punctuation tokens", () => {
  assert.equal(countWords("  alpha\u00a0!!!\n beta  "), 3);
});

test("oversize snapshot import fails before requiring a DOM", () => {
  const oversizedHtml = "x".repeat(MAX_SNAPSHOT_SIZE + 1);

  assert.throws(
    () => readStatsSnapshot(oversizedHtml),
    { message: "This Stats HTML exceeds the 12 MB import limit." },
  );
});

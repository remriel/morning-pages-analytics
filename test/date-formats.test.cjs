const test = require("node:test");
const assert = require("node:assert/strict");
const moment = require("moment");
const { DATE_FORMAT_PRESETS, normalizeFolderRule, includedDate } = require("../src/history.js");
const daily = { folder: "Daily", format: "YYYY-MM-DD", template: "" };
const file = (title) => ({ path: `Ledger/${title}.md`, extension: "md", stat: { ctime: new Date(2026, 10, 10).getTime() } });
const date = (title, rule) => includedDate(file(title), daily, ["Ledger"], moment, true, { Ledger: rule });

test("all twelve presets parse their displayed examples with the actual date parser", () => {
  assert.ok(DATE_FORMAT_PRESETS.length >= 12);
  for (const [format, example] of DATE_FORMAT_PRESETS) {
    assert.equal(date(example, { source: "filename", formats: [format] }), moment(example, format, true).format("YYYY-MM-DD"), format);
  }
});

test("automatic mode recognizes mixed titles including written months without configuring formats", () => {
  for (const title of ["2026-09-13", "2026.09.13", "2026_09_13", "20260913", "13-09-2026", "09-13-2026", "September 13 2026", "September 13, 2026", "13 September 2026", "13 Sep 2026", "Sep 13 2026", "Sep 13, 2026"]) {
    assert.equal(date(title, { source: "auto" }), "2026-09-13", title);
  }
  assert.equal(date("Archive/September 13 2026", { source: "auto" }), "2026-09-13");
  assert.equal(date("February 30 2026", { source: "auto" }), null);
  assert.equal(date("undated thoughts", { source: "auto" }), null);
});

test("multiple selected formats match simultaneously and conflicting numeric dates are excluded", () => {
  const rule = { source: "filename", formats: ["YYYY-MM-DD", "MMMM D YYYY"] };
  assert.equal(date("2026-09-13", rule), "2026-09-13");
  assert.equal(date("September 13 2026", rule), "2026-09-13");
  assert.equal(date("03-04-2026", { source: "auto" }), null);
  assert.equal(date("03-04-2026", { source: "filename", formats: ["DD-MM-YYYY"] }), "2026-04-03");
  assert.equal(date("03-04-2026", { source: "filename", formats: ["MM-DD-YYYY"] }), "2026-03-04");
  assert.equal(date("2026-09-13", { source: "filename", formats: [] }), null);
});

test("old single-format rules migrate without changing their behavior", () => {
  assert.deepEqual(normalizeFolderRule({ source: "filename", format: " DD-MM-YYYY " }), { source: "filename", formats: ["DD-MM-YYYY"] });
  assert.deepEqual(normalizeFolderRule({ source: "filename", format: "" }).formats, [""]);
  assert.deepEqual(normalizeFolderRule({ source: "filename", formats: [] }).formats, []);
  assert.equal(date("2026-09-13", { source: "filename", formats: [""] }), "2026-09-13");
});

const { WORD_GOAL, GROUPS } = require("./analysis.js");
const DAY = 86400000;
const CACHE_VERSION = 3;
const DATE_FORMAT_PRESETS = [
  ["YYYY-MM-DD", "2026-11-10"], ["YYYY.MM.DD", "2026.11.10"],
  ["YYYY_MM_DD", "2026_11_10"], ["YYYYMMDD", "20261110"],
  ["DD-MM-YYYY", "10-11-2026"], ["MM-DD-YYYY", "11-10-2026"],
  ["D MMM YYYY", "10 Nov 2026"], ["MMMM D, YYYY", "November 10, 2026"],
  ["MMMM D YYYY", "September 13 2026"], ["D MMMM YYYY", "13 September 2026"],
  ["MMM D YYYY", "Sep 13 2026"], ["MMM D, YYYY", "Sep 13, 2026"],
];

function normalizeFolderRule(rule = {}) {
  rule = rule || {};
  const formats = Array.isArray(rule.formats) ? rule.formats : [typeof rule.format === "string" ? rule.format : ""];
  return {
    source: ["filename", "auto"].includes(rule.source) ? rule.source : "creation",
    formats: [...new Set(formats.filter((format) => typeof format === "string").map((format) => format.trim()))],
  };
}
const FIELDS = ["words", "unique", "paragraphs", "sentences", "positive", "negative"];
const ordinal = (date) => Date.parse(`${date}T00:00:00Z`) / DAY;
const isoDay = (day) => new Date(day * DAY).toISOString().slice(0, 10);
const validDay = (date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(ordinal(date)) && isoDay(ordinal(date)) === date;

function dailyDate(file, settings, moment) {
  if (file?.extension !== "md") return null;
  const prefix = settings.folder ? `${settings.folder}/` : "";
  if (!file.path.startsWith(prefix) || file.path === settings.template) return null;
  const relative = file.path.slice(prefix.length, -3);
  const date = moment(relative, settings.format, true);
  if (!date.isValid() || date.format(settings.format) !== relative) return null;
  const day = date.format("YYYY-MM-DD");
  return validDay(day) ? day : null;
}

function normalizeFolders(folders) {
  return [...new Set((Array.isArray(folders) ? folders : [folders]).filter((folder) => typeof folder === "string")
    .map((folder) => folder.trim().replace(/^\/+|\/+$/g, "")).filter(Boolean))];
}

function includedDate(file, daily, folders, moment, includeSubfolders = true, folderDateRules = {}) {
  const dailyDay = dailyDate(file, daily, moment);
  if (dailyDay) return dailyDay;
  if (file?.extension !== "md" || file.path === daily.template) return null;
  const folder = normalizeFolders(folders).filter((folder) => file.path.startsWith(`${folder}/`) && (includeSubfolders || !file.path.slice(folder.length + 1).includes("/"))).sort((a, b) => b.length - a.length)[0];
  if (!folder) return null;
  const rule = normalizeFolderRule(folderDateRules[folder]);
  if (rule.source === "filename" || rule.source === "auto") {
    const formats = rule.source === "auto" ? [daily.format, ...DATE_FORMAT_PRESETS.map(([format]) => format)] : rule.formats;
    const dates = new Set();
    for (const format of formats) {
      const settings = { ...daily, folder, format: format || daily.format };
      const day = dailyDate(file, settings, moment) || dailyDate({ path: `${folder}/${file.path.split("/").at(-1)}`, extension: file.extension }, settings, moment);
      if (day) dates.add(day);
    }
    return dates.size === 1 ? [...dates][0] : null;
  }
  const timestamp = file.stat?.ctime;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  const created = new Date(timestamp);
  if (!Number.isFinite(created.getTime())) return null;
  const day = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;
  return validDay(day) ? day : null;
}

function safeCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function recordStats(stats) {
  return {
    ...Object.fromEntries(FIELDS.map((field) => [field, safeCount(stats[field])])),
    ...Object.fromEntries(Object.entries(GROUPS).map(([name, group]) => [name,
      Object.fromEntries(group.map(({ key }) => [key, safeCount(stats[name]?.[key])])),
    ])),
  };
}

function loadRecords(data) {
  const records = new Map();
  if (data?.version !== CACHE_VERSION || !Array.isArray(data.entries)) return records;
  for (const entry of data.entries) {
    if (!entry || typeof entry.path !== "string" || !validDay(entry.date)) continue;
    records.set(entry.path, { path: entry.path, date: entry.date, ctime: safeCount(entry.ctime), mtime: safeCount(entry.mtime), size: safeCount(entry.size), ...recordStats(entry) });
  }
  return records;
}

function addStats(total, entry) {
  for (const field of FIELDS) total[field] += entry[field];
  for (const [name, group] of Object.entries(GROUPS)) {
    for (const { key } of group) total[name][key] += entry[name][key];
  }
}

function groupDays(entries) {
  const days = new Map();
  for (const entry of entries) {
    if (!days.has(entry.date)) days.set(entry.date, { date: entry.date, entries: [], ...recordStats({}) });
    const day = days.get(entry.date);
    day.entries.push(entry);
    addStats(day, entry);
  }
  for (const day of days.values()) day.entries.sort((a, b) => (b.ctime || 0) - (a.ctime || 0) || (a.path || "").localeCompare(b.path || ""));
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function historyWindow(days, today, range, custom) {
  const last = days.at(-1)?.date ?? today;
  const customRange = range === "custom" && validDay(custom?.start) && validDay(custom?.end) && custom.start <= custom.end;
  const end = customRange ? custom.end : last > today ? last : today;
  const start = customRange ? custom.start : range === 0 ? days[0]?.date ?? end : isoDay(ordinal(end) - (Number(range) || 30) + 1);
  return { start, end, days: days.filter(({ date }) => date >= start && date <= end) };
}

function previousWindow(days, { start, end }) {
  if (!days.length || days[0].date >= start) return null;
  const first = ordinal(start);
  const previous = isoDay(Math.max(ordinal("0000-01-01"), first - (ordinal(end) - first + 1)));
  const last = isoDay(first - 1);
  return historyWindow(days, last, "custom", { start: previous, end: last });
}

function combineKeywords(target, words) {
  for (const [word, count] of words) target.set(word, (target.get(word) ?? 0) + count);
}

function summarizeDays(days, today) {
  const total = recordStats({});
  let best = 0;
  let streak = 0;
  let previous = -Infinity;
  let goalDays = 0;
  let writingDays = 0;
  for (const day of days) {
    addStats(total, day);
    if (day.words > 0) writingDays++;
    if (day.words < WORD_GOAL) continue;
    goalDays++;
    const current = ordinal(day.date);
    streak = current === previous + 1 ? streak + 1 : 1;
    best = Math.max(best, streak);
    previous = current;
  }
  const distance = ordinal(today) - previous;
  return { ...total, writingDays, goalDays, best, current: distance >= 0 && distance <= 1 ? streak : 0 };
}

function seriesBuckets(window) {
  const first = ordinal(window.start);
  const last = ordinal(window.end);
  const span = last - first + 1;
  const step = span <= 90 ? 1 : span <= 365 ? 7 : Math.max(7, Math.ceil(span / 90 / 7) * 7);
  const buckets = new Map();
  for (const day of window.days) {
    const start = first + Math.floor((ordinal(day.date) - first) / step) * step;
    if (!buckets.has(start)) buckets.set(start, { date: isoDay(start), end: isoDay(Math.min(last, start + step - 1)), ...recordStats({}) });
    addStats(buckets.get(start), day);
  }
  return { first, last, step, buckets: [...buckets.values()] };
}

module.exports = { DATE_FORMAT_PRESETS, normalizeFolderRule, CACHE_VERSION, dailyDate, includedDate, normalizeFolders, ordinal, isoDay, validDay, recordStats, loadRecords, groupDays, historyWindow, previousWindow, summarizeDays, seriesBuckets, combineKeywords };

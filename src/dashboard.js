const { getWordGoal, GROUPS, PAIRS, rankKeywords } = require("./analysis.js");
const { ordinal, isoDay, validDay, groupDays, historyWindow, previousWindow, summarizeDays, seriesBuckets } = require("./history.js");
const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const dateLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const tickLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
const SVG = "http://www.w3.org/2000/svg";
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const CATEGORY_NAMES = { feelings: "Feeling mostly", topics: "Thinking mostly about", time: "Time orientation", senses: "Primary sense", pronouns: "Us and them" };
const CUE_GROUPS = ["feelings", "topics", "time"];
const COLORS = ["violet", "pink", "blue", "green", "amber", "orange"];

function el(parent, tag, className, text) {
  const node = parent.ownerDocument.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  parent.append(node);
  return node;
}

function button(parent, label, click, className) {
  const node = el(parent, "button", className, label);
  node.type = "button";
  node.addEventListener("click", click);
  return node;
}

function displayDate(date, formatter = dateLabel) {
  return formatter.format(new Date(`${date}T00:00:00Z`));
}

function metrics(parent, values) {
  const cards = el(parent, "dl", "mpa-metrics");
  for (const [label, value] of values) {
    const card = el(cards, "div", "mpa-metric");
    el(card, "dt", "", label);
    el(card, "dd", "", typeof value === "number" ? number.format(value) : value);
  }
}

function bars(parent, rows) {
  const list = el(parent, "div", "mpa-bars");
  const max = Math.max(1, ...rows.map(([, value]) => value));
  for (const [label, value, color] of rows) {
    const row = el(list, "div", "mpa-bar-row");
    el(row, "span", "", label);
    el(row, "strong", "", number.format(value));
    const track = el(row, "div", "mpa-bar-track");
    track.setAttribute("aria-hidden", "true");
    el(track, "div", `mpa-bar-fill ${color ?? ""}`).style.width = `${value / max * 100}%`;
  }
}

function card(parent, label, subtitle) {
  const node = el(parent, "section", "mpa-card");
  el(node, "h3", "", label);
  if (subtitle) el(node, "p", "mpa-caption", subtitle);
  return node;
}

function dominant(stats, group) {
  const rows = GROUPS[group].map((item) => ({ ...item, count: stats[group][item.key] }));
  rows.sort((a, b) => b.count - a.count);
  if (!rows[0].count) return { label: "No cues", color: "slate" };
  if (rows[0].count === rows[1].count) return { label: "Mixed", color: "slate" };
  return rows[0];
}

function categoryCard(parent, stats, name) {
  const node = card(parent, CATEGORY_NAMES[name]);
  const leading = dominant(stats, name);
  el(node, "div", `mpa-dominant mpa-color is-${leading.color}`, leading.label);
  const rows = GROUPS[name].map(({ label, key, color }) => [label, stats[name][key], `is-${color}`]);
  if (name === "feelings" || name === "topics") rows.sort((a, b) => b[1] - a[1]);
  bars(node, rows);
}

function mindset(parent, stats) {
  const section = card(parent, "Mindset while writing", "Balance of matched cues in each pair.");
  const grid = el(section, "div", "mpa-rings");
  for (const { label, sides } of PAIRS) {
    const values = sides.map((key) => ({ ...GROUPS.mindset.find((item) => item.key === key), count: stats.mindset[key] }));
    const total = values[0].count + values[1].count;
    const share = total ? Math.round(100 * values[0].count / total) : null;
    const tile = el(grid, "div", "mpa-ring-card");
    el(tile, "h4", "", label);
    const alt = total ? `${values[0].label} ${share}%, ${values[1].label} ${100 - share}%` : `${label}: no cues`;
    const ring = svg(tile, "svg", { viewBox: "0 0 88 88", role: "img", "aria-label": alt, class: "mpa-ring" });
    const circle = { cx: 44, cy: 44, r: 34, pathLength: 100, fill: "none", transform: "rotate(-90 44 44)" };
    svg(ring, "circle", { ...circle, class: `mpa-ring-track${total ? ` mpa-color is-${values[1].color}` : ""}` });
    if (share) svg(ring, "circle", { ...circle, class: `mpa-ring-fill mpa-color is-${values[0].color}`, "stroke-dasharray": `${share} ${100 - share}` });
    svg(ring, "text", { x: 44, y: 47, "text-anchor": "middle", "aria-hidden": "true" }, total ? `${Math.max(share, 100 - share)}%` : "—");
    const legend = el(tile, "div", "mpa-ring-key");
    for (const [index, item] of values.entries()) {
      const row = el(legend, "div", `mpa-color is-${item.color}`);
      el(row, "span", "", item.label);
      el(row, "strong", "", total ? `${index === 0 ? share : 100 - share}%` : "—");
    }
  }
}

function renderBreakdowns(parent, stats) {
  const leading = el(parent, "div", "mpa-analysis-grid");
  categoryCard(leading, stats, "feelings");
  categoryCard(leading, stats, "topics");
  mindset(parent, stats);
  const dimensions = el(parent, "div", "mpa-dimension-grid");
  for (const name of ["time", "senses", "pronouns"]) categoryCard(dimensions, stats, name);
  el(parent, "p", "mpa-caption", "The charts count English words associated with each category.");
}

function renderVocabulary(root, current, previous = null) {
  root.replaceChildren();
  const top = rankKeywords(current.counts);
  if (!top.length) {
    el(root, "p", "mpa-caption", "No keywords in this selection.");
    return;
  }
  const cloud = el(root, "ul", "mpa-cloud");
  for (const [index, [word, count]] of top.entries()) {
    const term = el(cloud, "li", `mpa-color is-${COLORS[index % COLORS.length]}`, word);
    const label = `${word} · ${number.format(count)} ${count === 1 ? "use" : "uses"}`;
    term.title = label;
    term.setAttribute("aria-label", label);
    term.style.fontSize = `${0.82 + 1.38 * Math.sqrt(count / top[0][1])}rem`;
  }
  const details = el(root, "details", "mpa-keywords-details");
  el(details, "summary", "", "Top words and counts");
  const ranks = el(details, "ol", "mpa-keyword-ranks");
  for (const [word, count] of top.slice(0, 16)) {
    const row = el(ranks, "li");
    el(row, "span", "", word);
    el(row, "strong", "", number.format(count));
  }
  if (previous?.words && current.words) {
    const emerging = [...current.counts].filter(([, count]) => count >= 2).map(([word, count]) => ({
      word, change: 1000 * (count / current.words - (previous.counts.get(word) ?? 0) / previous.words),
    })).filter(({ change }) => change >= 0.05).sort((a, b) => b.change - a.change || a.word.localeCompare(b.word)).slice(0, 8);
    if (emerging.length) {
      el(root, "h4", "mpa-emerging-title", "Emerging words");
      el(root, "p", "mpa-caption", "Change in uses per 1,000 words versus the preceding period.");
      const list = el(root, "ul", "mpa-keyword-ranks");
      for (const { word, change } of emerging) {
        const row = el(list, "li");
        el(row, "span", "", word);
        el(row, "strong", "", `+${number.format(change)}`);
      }
    }
  }
  if (current.missing || previous?.missing) el(root, "p", "mpa-caption", "Some notes could not be read. Refresh daily history to retry.");
}

function renderStats(root, state, showHistory) {
  root.replaceChildren();
  root.classList.add("mpa-view", "mpa-sidebar");
  const header = el(root, "header", "mpa-hero");
  el(header, "div", "mpa-kicker", "MORNING PAGES");
  el(header, "h2", "", "Writing stats");
  el(header, "p", "mpa-note-name", state.name || "Open a Markdown note to see your stats.");
  if (state.stats) {
    const { words } = state.stats;
    el(header, "div", "mpa-count", `${number.format(words)} / ${getWordGoal()}`);
    const progress = el(header, "progress");
    progress.max = getWordGoal();
    progress.value = Math.min(words, getWordGoal());
    progress.setAttribute("aria-label", "Writing goal progress");
    el(header, "p", "mpa-goal-message", words >= getWordGoal() ? "Goal reached" : `${getWordGoal() - words} to the writing goal`);
  } else if (state.message) {
    el(header, "p", "mpa-goal-message", state.message);
  }
  const actions = el(root, "div", "mpa-actions");
  button(actions, "Open writing history", showHistory, "mod-cta");
  if (!state.stats) return;
  const stats = state.stats;
  if (state.date) el(root, "p", "mpa-caption", `Daily note · ${displayDate(state.date)}`);
  const writing = [["Unique words", stats.unique], ["Paragraphs", stats.paragraphs], ["Sentences", stats.sentences], ["Reading time", stats.words ? `~${Math.ceil(stats.words / 220)} min` : "0 min"]];
  if (state.pace) writing.push(["Words added/min", state.pace.wordsPerMinute], ["Active edit minutes", state.pace.minutes]);
  metrics(root, writing);
  renderBreakdowns(root, stats);
  const vocabulary = card(root, "Word cloud", "Larger words appear more often.");
  renderVocabulary(el(vocabulary, "div"), { counts: stats.keywords, words: stats.words });
}

function svg(parent, name, attrs, text) {
  const node = parent.ownerDocument.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  parent.append(node);
  return node;
}

function drawChart(host, scale, options, width) {
  host.replaceChildren();
  const height = 180;
  const left = 39;
  const right = width - 12;
  const top = 15;
  const bottom = height - 27;
  const span = scale.last - scale.first + 1;
  const slot = (right - left) / span;
  const yMax = options.percentage ? 100 : Math.max(1, options.guide ?? 0, ...scale.buckets.flatMap((row) => options.series.map(({ value }) => value(row) ?? 0)));
  const tick = yMax / 2;
  const y = (value) => bottom - value * (bottom - top) / yMax;
  const x = (day) => left + (day - scale.first + 0.5) * slot;
  const plot = svg(host, "svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": options.label });

  for (const value of [0, tick, yMax]) {
    svg(plot, "line", { x1: left, x2: right, y1: y(value), y2: y(value), class: "mpa-grid-line" });
    svg(plot, "text", { x: left - 6, y: y(value) + 4, "text-anchor": "end" }, `${compact.format(value)}${options.percentage ? "%" : ""}`);
  }
  if (options.guide) svg(plot, "line", { x1: left, x2: right, y1: y(options.guide), y2: y(options.guide), class: "mpa-goal-line" });
  const ticks = [...new Set([scale.first, Math.floor((scale.first + scale.last) / 2), scale.last])];
  for (const [index, day] of ticks.entries()) {
    svg(plot, "text", { x: x(day), y: height - 7, "text-anchor": index === 0 ? "start" : index === ticks.length - 1 ? "end" : "middle" }, displayDate(isoDay(day), tickLabel));
  }

  const columnWidth = Math.min(30, Math.max(1, slot * scale.step * 0.7));
  const center = (row) => x((ordinal(row.date) + ordinal(row.end)) / 2);
  const labelPeriod = (row) => row.date === row.end ? displayDate(row.date) : `${displayDate(row.date)} to ${displayDate(row.end)}`;
  if (options.stacked) {
    for (const row of scale.buckets) {
      const total = options.series.reduce((sum, series) => sum + series.value(row), 0);
      if (!total) continue;
      let heightUsed = 0;
      for (const series of options.series) {
        const value = series.value(row);
        if (!value) continue;
        const share = 100 * value / total;
        const mark = svg(plot, "rect", { x: center(row) - columnWidth / 2, y: y(heightUsed + share), width: columnWidth, height: y(heightUsed) - y(heightUsed + share), class: `mpa-mark ${series.color}` });
        svg(mark, "title", {}, `${labelPeriod(row)} · ${series.label}: ${number.format(value)} cues (${number.format(share)}%)`);
        heightUsed += share;
      }
    }
    return;
  }

  for (const series of options.series) {
    let path = "";
    let previous = -Infinity;
    if (!options.columns) {
      for (const row of scale.buckets) {
        const value = series.value(row);
        if (!row.words || value === null) continue;
        const day = ordinal(row.date);
        path += `${day === previous + scale.step ? "L" : "M"}${center(row)},${y(value)} `;
        previous = day;
      }
      if (path) svg(plot, "path", { d: path.trim(), class: `mpa-trace ${series.color}` });
    }
    for (const row of scale.buckets) {
      if (!options.columns && !row.words) continue;
      const value = series.value(row);
      if (value === null) continue;
      const mark = options.columns
        ? svg(plot, "rect", { x: center(row) - columnWidth / 2, y: Math.min(bottom - 1, y(value)), width: columnWidth, height: Math.max(1, bottom - y(value)), class: `mpa-mark ${value >= getWordGoal() && scale.step === 1 ? "is-goal" : series.color}` })
        : svg(plot, "circle", { cx: center(row), cy: y(value), r: 3, class: `mpa-mark ${series.color}` });
      svg(mark, "title", {}, `${labelPeriod(row)} · ${series.label} ${number.format(value)}${options.percentage ? "%" : ""}`);
    }
  }
}

function legend(parent, series) {
  const key = el(parent, "div", "mpa-key");
  for (const item of series) el(key, "span", `mpa-color ${item.color}`, item.label);
}

function addTrend(parent, scale, state, actions, disposers) {
  const node = card(parent, "Language over time");
  const field = el(node, "label", "mpa-field", "Signal");
  const select = el(field, "select", "dropdown mpa-signal");
  el(select, "option", "", "Emotion cue density").value = "feelings";
  for (const pair of PAIRS) el(select, "option", "", `${pair.label} balance`).value = `pair-${pair.key}`;
  const topics = el(select, "optgroup");
  topics.label = "Topics";
  for (const { key, label } of GROUPS.topics) el(topics, "option", "", label).value = `topic-${key}`;
  select.value = state.signal;
  select.addEventListener("change", () => actions.change({ signal: select.value }, ".mpa-signal"));
  const pair = PAIRS.find(({ key }) => state.signal === `pair-${key}`);
  const topic = GROUPS.topics.find(({ key }) => state.signal === `topic-${key}`);
  let series;
  if (pair) {
    series = pair.sides.map((key) => {
      const { label, color } = GROUPS.mindset.find((item) => item.key === key);
      return { label, color: `is-${color}`, value: (row) => {
        const total = pair.sides.reduce((sum, side) => sum + row.mindset[side], 0);
        return total ? row.mindset[key] / total * 100 : null;
      } };
    });
  } else {
    series = [{ label: topic?.label ?? "Emotion cues", color: `is-${topic?.color ?? "violet"}`, value: (row) => {
      const count = topic ? row.topics[topic.key] : Object.values(row.feelings).reduce((sum, value) => sum + value, 0);
      return row.words ? count * 100 / row.words : null;
    } }];
  }
  el(node, "p", "mpa-caption", pair ? "Share of cues within the selected pair." : "Matched cues per 100 words.");
  legend(node, series);
  addChart(node, scale, { label: `Language cues over time: ${series.map(({ label }) => label).join(" and ")}`, series, percentage: Boolean(pair) }, disposers);
}

function addComposition(parent, scale, state, actions, disposers) {
  const node = card(parent, "Composition over time", "Share of matched cues within each period.");
  const field = el(node, "label", "mpa-field", "Breakdown");
  const select = el(field, "select", "dropdown mpa-composition");
  for (const [index, key] of CUE_GROUPS.entries()) el(select, "option", "", ["Feelings", "Topics", "Time orientation"][index]).value = key;
  select.value = state.composition;
  select.addEventListener("change", () => actions.change({ composition: select.value }, ".mpa-composition"));
  const series = GROUPS[state.composition].map(({ key, label, color }) => ({ label, color: `is-${color}`, value: (row) => row[state.composition][key] }));
  legend(node, series);
  addChart(node, scale, { label: `${select.selectedOptions[0].textContent} composition over time`, series, percentage: true, stacked: true }, disposers);
}

function addChart(parent, scale, options, disposers) {
  const host = el(parent, "div", "mpa-plot");
  let width;
  const draw = () => {
    const next = Math.max(240, Math.round(host.getBoundingClientRect().width || 420));
    if (width === next) return;
    width = next;
    drawChart(host, scale, options, width);
  };
  draw();
  const Observer = host.ownerDocument.defaultView?.ResizeObserver;
  if (Observer) {
    const observer = new Observer(draw);
    observer.observe(host);
    disposers.push(() => observer.disconnect());
  }
}

function monthStart(date) {
  return `${date.slice(0, 7)}-01`;
}

function adjacentMonth(date, offset) {
  const value = new Date(`${monthStart(date)}T00:00:00Z`);
  value.setUTCMonth(value.getUTCMonth() + offset);
  return value.toISOString().slice(0, 10);
}

function renderCalendar(root, state, days, pickDay, setMonth, period) {
  const header = el(root, "div", "mpa-calendar-header");
  header.tabIndex = -1;
  const previous = adjacentMonth(state.month, -1);
  const next = adjacentMonth(state.month, 1);
  button(header, "Previous", () => setMonth(previous, ".mpa-previous-month"), "mpa-previous-month").disabled = previous < monthStart(period.start);
  el(header, "strong", "", displayDate(state.month, monthLabel));
  button(header, "Next", () => setMonth(next, ".mpa-next-month"), "mpa-next-month").disabled = next > monthStart(period.end);
  const grid = el(root, "div", "mpa-calendar");
  for (const weekday of ["M", "T", "W", "T", "F", "S", "S"]) el(grid, "span", "mpa-weekday", weekday);
  const start = ordinal(state.month);
  const offset = (new Date(start * 86400000).getUTCDay() + 6) % 7;
  for (let blank = 0; blank < offset; blank++) el(grid, "span", "mpa-calendar-blank");
  for (let day = start; day < ordinal(next); day++) {
    const date = isoDay(day);
    const record = days.get(date);
    const words = record?.words ?? 0;
    const level = words >= getWordGoal() ? "is-goal" : words >= Math.ceil(getWordGoal() / 3) ? "is-mid" : words > 0 ? "is-low" : "is-empty";
    const label = `${displayDate(date)} · ${record ? `${number.format(words)} words` : "No indexed note"}`;
    const cell = record ? button(grid, String(day - start + 1), () => pickDay(date), `mpa-day ${level}`) : el(grid, "span", `mpa-day ${level}`, String(day - start + 1));
    cell.title = label;
    cell.setAttribute("aria-label", label);
    if (record) cell.setAttribute("aria-pressed", String(state.day === date));
    cell.dataset.day = date;
  }
  const key = el(root, "div", "mpa-calendar-key");
  const middle = Math.ceil(getWordGoal() / 3);
  const levels = [["empty", "0"]];
  if (middle > 1) levels.push(["low", `1–${middle - 1}`]);
  if (getWordGoal() > 1) levels.push(["mid", `${middle}–${getWordGoal() - 1}`]);
  levels.push(["goal", `${getWordGoal()}+`]);
  for (const [level, label] of levels) {
    el(key, "span", `mpa-day is-${level}`, label);
  }
}

function addCustomRange(parent, state, actions) {
  const form = el(parent, "form", "mpa-date-form");
  const inputs = ["start", "end"].map((key) => {
    const label = el(form, "label", "mpa-field", key === "start" ? "From" : "Through");
    const input = el(label, "input");
    input.type = "date";
    input.required = true;
    input.value = state.custom[key];
    return input;
  });
  const apply = el(form, "button", "mod-cta", "Apply range");
  apply.type = "submit";
  const error = el(form, "p", "mpa-caption");
  error.setAttribute("aria-live", "polite");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const [start, end] = inputs.map((input) => input.value);
    if (!validDay(start) || !validDay(end) || start > end) {
      error.textContent = "Choose a start date on or before the end date.";
      return;
    }
    actions.change({ custom: { start, end }, month: null, day: null }, ".mpa-date-form button");
  });
}

function addComparison(parent, summary, previous, today) {
  if (!previous?.days.length) return;
  const baseline = summarizeDays(previous.days, today);
  const change = (value) => `${value > 0 ? "+" : ""}${number.format(value)}`;
  const comparison = card(parent, "Compared with the preceding period", `${displayDate(previous.start)} to ${displayDate(previous.end)}`);
  const differences = GROUPS.feelings.map(({ key, label }) => ({ label, value: 100 * (summary.feelings[key] / Math.max(1, summary.words) - baseline.feelings[key] / Math.max(1, baseline.words)) }));
  differences.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const values = [["Words", change(summary.words - baseline.words)], ["Goal days", change(summary.goalDays - baseline.goalDays)]];
  if (Math.abs(differences[0].value) >= 0.05 && baseline.words && summary.words) {
    values.push([`${differences[0].label} cues per 100 words`, change(differences[0].value)]);
  }
  metrics(comparison, values);
}

function renderHistory(root, input, state, actions) {
  // Keep the existing cloud when the date range is unchanged. Besides avoiding
  // flicker, this keeps its height stable while its async data is requested.
  const previousCloud = root.querySelector(".mpa-history-vocabulary");
  const previousCloudHeight = previousCloud?.getBoundingClientRect().height ?? 0;
  root.replaceChildren();
  root.classList.add("mpa-view", "mpa-history");
  const disposers = [];
  const header = el(root, "header", "mpa-hero");
  el(header, "div", "mpa-kicker", "MORNING PAGES / DAILY NOTES");
  el(header, "h2", "", "Writing history");
  el(header, "p", "", "Explore your writing across days, weeks, and months.");
  const tools = el(root, "div", "mpa-actions mpa-history-tools");
  const rangeLabel = el(tools, "label", "mpa-field", "Date range");
  const range = el(rangeLabel, "select", "dropdown");
  for (const [value, label] of [[7, "7 days"], [14, "14 days"], [30, "30 days"], [60, "60 days"], [90, "90 days"], [180, "180 days"], [365, "1 year"], [0, "All dates"], ["custom", "Custom range"]]) {
    el(range, "option", "", label).value = String(value);
  }
  range.value = String(state.range);
  range.addEventListener("change", () => actions.change({ range: range.value === "custom" ? "custom" : Number(range.value), rangeOffset: 0, rangeChosen: true, day: null, month: null }, "select.mpa-range"));
  range.classList.add("mpa-range");
  for (const [direction, label, symbol] of [[-1, "Previous period", "←"], [1, "Next period", "→"]]) {
    const nav = button(tools, symbol, () => actions.change({ rangeOffset: (state.rangeOffset || 0) + direction, rangeChosen: true, day: null, month: null }, direction < 0 ? ".mpa-range-prev" : ".mpa-range-next"));
    nav.classList.add(direction < 0 ? "mpa-range-prev" : "mpa-range-next");
    nav.setAttribute("aria-label", label);
    nav.title = label;
    nav.disabled = typeof state.range !== "number" || state.range <= 0;
  }
  const refresh = button(tools, input.loading ? "Indexing…" : "Refresh daily history", actions.refresh);
  refresh.disabled = input.loading;
  const days = groupDays(input.entries);
  if (!days.length) {
    card(root, input.loading ? "Building your history" : "No notes indexed", input.status || "Create a Daily Note or add a writing folder in the plugin settings. Additional folders use note creation dates.");
    return () => {};
  }
  if (state.range === "custom") {
    if (!state.custom) {
      const initial = historyWindow(days, input.today, 30);
      state.custom = { start: initial.start, end: initial.end };
    }
    addCustomRange(root, state, actions);
  }
  let period = historyWindow(days, input.today, state.range, state.custom);
  if (typeof state.range === "number" && state.range > 0 && state.rangeOffset) {
    const shift = state.rangeOffset * state.range;
    period = historyWindow(days, input.today, "custom", { start: isoDay(ordinal(period.start) + shift), end: isoDay(ordinal(period.end) + shift) });
  }
  if (!state.rangeChosen && !period.days.length && state.range === 30) {
    state.range = 0;
    range.value = "0";
    period = historyWindow(days, input.today, 0);
  }
  el(root, "p", "mpa-caption", `${displayDate(period.start)} to ${displayDate(period.end)} · ${input.status || `${days.length} indexed days`}`);
  const summary = summarizeDays(period.days, input.today);
  const streaks = summarizeDays(days, input.today);
  const notesInRange = period.days.reduce((sum, day) => sum + day.entries.length, 0);
  metrics(root, [
    ["Words in range", summary.words], ["Notes", notesInRange], ["Writing days", summary.writingDays],
    ["Words per writing day", summary.writingDays ? summary.words / summary.writingDays : 0],
    ["Goal completion", period.days.length ? `${number.format(100 * summary.goalDays / period.days.length)}%` : "—"],
    ["Current goal streak", `${streaks.current} days`], ["Longest goal streak", `${streaks.best} days`],
  ]);
  if (!period.days.length) {
    card(root, "No notes in this range", "Choose All dates to browse older writing.");
    return () => {};
  }

  const scale = seriesBuckets(period);
  const grain = scale.step === 1 ? "day" : scale.step === 7 ? "7-day period" : `${scale.step}-day period`;
  const output = card(root, "Words over time", `Words per ${grain}${scale.step === 1 ? ` · dashed line shows the ${getWordGoal()}-word goal` : ""}`);
  addChart(output, scale, { label: "Words over time", columns: true, guide: scale.step === 1 ? getWordGoal() : null, series: [{ label: "Words", value: (row) => row.words, color: "is-volume" }] }, disposers);

  const trend = el(root, "div", "mpa-history-grid");
  addTrend(trend, scale, state, actions, disposers);
  addComposition(trend, scale, state, actions, disposers);
  const previous = state.range === 0 ? null : previousWindow(days, period);
  addComparison(root, summary, previous, input.today);

  el(root, "h3", "mpa-section-title", "Selected range breakdown");
  renderBreakdowns(root, summary);
  const words = card(root, "Word cloud", "Keyword counts across the selected range. Larger words appear more often.");
  const cloudKey = `${period.start}/${period.end}|${previous ? `${previous.start}/${previous.end}` : ""}`;
  let cloud;
  if (previousCloud?.dataset.periodKey === cloudKey) {
    cloud = previousCloud;
    words.append(cloud);
  } else {
    cloud = el(words, "div", "mpa-history-vocabulary");
    cloud.dataset.periodKey = cloudKey;
    if (previousCloudHeight) cloud.style.minHeight = `${previousCloudHeight}px`;
    el(cloud, "p", "mpa-caption", "Collecting keywords…");
  }
  actions.words(period, previous, cloud);

  const lower = el(root, "div", "mpa-history-grid mpa-history-lower");
  const dated = new Map(period.days.map((day) => [day.date, day]));
  const day = dated.get(state.day) ?? period.days.at(-1);
  state.day = day.date;
  if (!state.month || state.month < monthStart(period.start) || state.month > monthStart(period.end)) state.month = monthStart(day.date);
  const activity = card(lower, "Activity calendar", "Select a day to inspect its notes.");
  renderCalendar(activity, state, dated, (date) => actions.change({ day: date }, `[data-day="${date}"]`), (month, selector) => actions.change({ month }, selector), period);

  const detail = card(lower, "Day detail");
  const detailField = el(detail, "label", "mpa-field", "Inspect day");
  const detailSelect = el(detailField, "select", "dropdown mpa-day-select");
  for (const item of [...period.days].reverse()) el(detailSelect, "option", "", displayDate(item.date)).value = item.date;
  detailSelect.value = day.date;
  detailSelect.addEventListener("change", () => actions.change({ day: detailSelect.value, month: monthStart(detailSelect.value) }, "select.mpa-day-select"));
  metrics(detail, [["Words", day.words], ["Sentences", day.sentences], ["Positive cues", day.positive], ["Negative cues", day.negative]]);
  const notes = el(detail, "ul", "mpa-notes");
  for (const entry of input.noteOrder === "oldest" ? [...day.entries].reverse() : day.entries) {
    const row = el(notes, "li");
    button(row, entry.path.split("/").at(-1).replace(/\.md$/i, ""), () => actions.openNote(entry.path));
    el(row, "span", "mpa-caption", `${number.format(entry.words)} words`);
  }
  return () => { for (const dispose of disposers) dispose(); };
}

module.exports = { renderStats, renderHistory, renderVocabulary };

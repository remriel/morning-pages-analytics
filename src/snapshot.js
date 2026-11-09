const WORD_GOAL = 750;
const MAX_SNAPSHOT_SIZE = 12 * 1024 * 1024;
const SVG_NS = "http://www.w3.org/2000/svg";

const TEXT_ELEMENTS = new Set([
  "a", "b", "blockquote", "br", "div", "dl", "dt", "dd", "em", "h1", "h2", "h3",
  "h4", "h5", "hr", "i", "li", "ol", "p", "section", "small", "span", "strong",
  "table", "tbody", "td", "th", "thead", "tr", "ul",
]);
const BLOCK_ELEMENTS = new Set([
  "blockquote", "br", "div", "h1", "h2", "h3", "h4", "h5", "hr", "li", "ol", "p",
  "pre", "section", "table", "td", "th", "ul",
]);
const CHART_ELEMENTS = new Set([
  "circle", "ellipse", "g", "line", "path", "polygon", "polyline", "rect", "text", "tspan",
]);
const CHART_MEASUREMENTS = [
  "x", "y", "x1", "y1", "x2", "y2", "width", "height", "cx", "cy", "r", "rx", "ry",
  "dx", "dy", "opacity", "fill-opacity", "stroke-opacity", "stroke-width", "font-size",
  "points", "stroke-dasharray",
];
const PAGE_CLASS_MAP = {
  "v-row": "mpa-row",
  "v-col": "mpa-column",
  "mindset-charts-row": "mpa-mindset-row",
  "entry-summary": "mpa-entry-summary",
  "cloud": "mpa-cloud-word",
  "small": "mpa-facts",
};
const HIDDEN_CONTENT = [
  "[hidden]", '[aria-hidden="true"]', ".v-overlay", ".v-progress-linear", ".v-icon",
  ".chart-html-tooltip", ".chart-bar-tooltip", ".stats-button-container",
].join(", ");

function normalizeText(text) {
  return text.trim().replace(/\s+/gu, " ");
}

function countWords(text) {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(" ").length : 0;
}

function goalStatus(wordCount) {
  const remaining = Math.max(0, WORD_GOAL - wordCount);
  return { remaining, complete: remaining === 0 };
}

function composerText(node, parts) {
  if (node.nodeType === 3) {
    parts.push(node.data);
    return;
  }
  if (node.nodeType !== 1 || ["script", "style", "template"].includes(node.localName)) return;

  const isBlock = BLOCK_ELEMENTS.has(node.localName);
  if (isBlock) parts.push(" ");
  for (const child of node.childNodes) composerText(child, parts);
  if (isBlock) parts.push(" ");
}

function chartColor(value) {
  if (!value) return null;
  if (/^(?:#[\da-f]{3,8}|rgba?\([\d.,%\s]+\)|currentColor|none|transparent|black|white)$/i.test(value)) {
    return value;
  }
  if (value === "var(--color-text-muted)" || value === "var(--color-text-secondary)") {
    return "var(--text-muted)";
  }
  if (value === "var(--color-text-primary)") return "currentColor";
  if (value === "var(--color-border)") return "var(--background-modifier-border)";
  return null;
}

function copyChartNode(source, target, document) {
  if (!CHART_ELEMENTS.has(source.localName) || source.matches(HIDDEN_CONTENT)) return;

  const element = document.createElementNS(SVG_NS, source.localName);
  for (const name of CHART_MEASUREMENTS) {
    const value = source.getAttribute(name) ?? source.style?.getPropertyValue(name);
    if (value && /^[\d.,+eE%\s-]+(?:px|em)?$/.test(value)) element.setAttribute(name, value);
  }
  for (const name of ["fill", "stroke"]) {
    const value = chartColor(source.getAttribute(name) ?? source.style?.getPropertyValue(name));
    if (value) element.setAttribute(name, value);
  }
  for (const name of ["text-anchor", "alignment-baseline", "dominant-baseline"]) {
    const value = source.getAttribute(name);
    if (value && /^[a-z-]+$/.test(value)) element.setAttribute(name, value);
  }
  const path = source.getAttribute("d");
  if (path && /^[MLHVCSQTAZmlhvcsqtaz\d.eE,+\s-]+$/.test(path)) element.setAttribute("d", path);

  const transform = source.getAttribute("transform");
  if (transform && /^(?:(?:matrix|translate|rotate|scale|skewX|skewY)\([\d.eE,+\s-]+\)\s*)+$/.test(transform)) {
    element.setAttribute("transform", transform);
  }
  if (source.localName === "text" || source.localName === "tspan") {
    element.textContent = source.textContent;
  } else {
    for (const child of source.children) copyChartNode(child, element, document);
  }
  target.append(element);
}

function copyChart(source, target, document) {
  const width = Number(source.getAttribute("width"));
  const height = Number(source.getAttribute("height"));
  if (!(width > 0 && width <= 10_000 && height > 0 && height <= 10_000)) return;

  const chart = document.createElementNS(SVG_NS, "svg");
  chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  chart.setAttribute("width", String(width));
  chart.setAttribute("height", String(height));
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", "Chart from the saved 750 Words report");
  for (const child of source.children) copyChartNode(child, chart, document);
  target.append(chart);
}

function copyStatsNode(source, target, document) {
  if (source.nodeType === 3) {
    target.append(document.createTextNode(source.data));
    return;
  }
  if (source.nodeType !== 1 || source.matches(HIDDEN_CONTENT) || source.style?.display === "none") return;

  if (source.localName === "svg") {
    copyChart(source, target, document);
    return;
  }
  const cloudWord = source.localName === "button" && source.parentElement?.classList.contains("cloud");
  if (!cloudWord && !TEXT_ELEMENTS.has(source.localName)) return;

  const tag = cloudWord || source.localName === "a" ? "span" : source.localName;
  const element = document.createElement(tag);
  for (const className of source.classList) {
    if (Object.hasOwn(PAGE_CLASS_MAP, className)) element.classList.add(PAGE_CLASS_MAP[className]);
  }
  if (cloudWord) {
    const fontSize = Number(source.style.fontSize.match(/^([\d.]+)%$/)?.[1]);
    if (fontSize >= 50 && fontSize <= 400) element.style.fontSize = `${fontSize}%`;
    const label = source.getAttribute("data-tooltip");
    if (label) element.title = normalizeText(label);
  }
  for (const child of source.childNodes) copyStatsNode(child, element, document);
  if (element.textContent.trim() || element.querySelector("svg") || tag === "br" || tag === "hr") {
    target.append(element);
  }
}

function readStatsSnapshot(html, document) {
  if (html.length > MAX_SNAPSHOT_SIZE) throw new Error("This Stats HTML exceeds the 12 MB import limit.");

  const template = document.createElement("template");
  // The template stays detached. Only newly created, allowlisted nodes reach the view.
  template.innerHTML = html;
  const page = template.content.querySelector("main .stats-page");
  const stats = page?.querySelector("#entry-stats, .entry-stats");
  const summary = stats?.querySelector(".entry-summary");
  if (!summary) throw new Error("Save an individual 750 Words Stats page as HTML and try that file.");

  const fragment = document.createDocumentFragment();
  for (const source of stats.children) {
    const section = document.createElement("section");
    section.className = "mpa-reference-section";
    copyStatsNode(source, section, document);
    if (section.textContent.trim() || section.querySelector("svg")) fragment.append(section);
  }

  const entry = page.querySelector("#entry-editor .tiptap, .entry-editor .tiptap");
  const entryParts = [];
  if (entry) composerText(entry, entryParts);
  const wordCountLabel = summary.textContent.match(/\bYou wrote ([\d,]+) words\b/i)?.[1];
  return {
    fragment,
    referenceText: entry ? normalizeText(entryParts.join("")) : null,
    referenceWordCount: wordCountLabel ? Number(wordCountLabel.replaceAll(",", "")) : null,
  };
}

module.exports = { WORD_GOAL, MAX_SNAPSHOT_SIZE, countWords, goalStatus, normalizeText, readStatsSnapshot };

const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const readSource = (name) => readFileSync(join(root, "src", name), "utf8").trimEnd();

const bundle = `"use strict";
// Built by node scripts/build.cjs.
const snapshot = (() => {
  const module = { exports: {} };
${readSource("snapshot.js")}
  return module.exports;
})();
${readSource("plugin.js")}
`;

writeFileSync(join(root, "main.js"), bundle);

const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const readSource = (name) => readFileSync(join(root, "src", name), "utf8").trimEnd();

const modules = ["analysis", "history", "dashboard", "settings"].map((name, index, ordered) => `const ${name} = (() => {
  const module = { exports: {} };
${index ? `  const require = (id) => ({ ${ordered.slice(0, index).map((dependency) => `"./${dependency}.js": ${dependency}`).join(", ")} })[id];` : ""}
${readSource(`${name}.js`)}
  return module.exports;
})();`).join("\n");

const bundle = `"use strict";
// Built by node scripts/build.cjs.
${modules}
${readSource("plugin.js")}
`;

writeFileSync(process.argv[2] || join(root, "main.js"), bundle);

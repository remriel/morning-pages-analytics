const test = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } = require("node:fs");
const { execFileSync, spawnSync } = require("node:child_process");
const { tmpdir } = require("node:os");
const { basename, dirname, join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");

const root = resolve(__dirname, "..");

function findBrowser() {
  const candidates = [process.env.CHROME_PATH];
  if (process.platform === "win32") {
    candidates.push(join(process.env.ProgramFiles || "C:\\Program Files", "Google/Chrome/Application/chrome.exe"));
    candidates.push(join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Microsoft/Edge/Application/msedge.exe"));
  } else if (process.platform === "darwin") candidates.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
  else for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const found = spawnSync("which", [name], { encoding: "utf8" });
    if (found.status === 0) candidates.push(found.stdout.trim());
  }
  return candidates.find((path) => path && existsSync(path));
}

test("settings allow editing defaults, resetting one category and navigating at desktop and phone widths", (t) => {
  const browser = findBrowser();
  if (!browser) {
    if (process.env.MPA_REQUIRE_BROWSER === "1") throw new Error("Chrome or Chromium is required for settings verification");
    return t.skip("Chrome or Chromium is unavailable");
  }
  const tempRoot = resolve(tmpdir());
  const temporary = resolve(mkdtempSync(join(tempRoot, "mpa-settings-test-")));
  try {
    const bundle = join(temporary, "main.js");
    execFileSync(process.execPath, [join(root, "scripts/build.cjs"), bundle], { cwd: root });
    let html = readFileSync(join(__dirname, "fixtures/settings.html"), "utf8")
      .replace("../../styles.css", pathToFileURL(join(root, "styles.css")).href)
      .replace("../../main.js", pathToFileURL(bundle).href);
    if (process.env.MPA_OBSIDIAN_CSS) {
      html = html.replace('<link rel="stylesheet"', `<link rel="stylesheet" href="${pathToFileURL(resolve(process.env.MPA_OBSIDIAN_CSS)).href}">\n<link rel="stylesheet"`);
    }
    const fixture = join(temporary, "settings.html");
    writeFileSync(fixture, html);
    for (const [layout, size] of [["large-type", "1100,1700"], ["medium-pane", "1100,1700"], ["desktop", "1100,1400"], ["phone", "390,1700"], ["compact-phone", "320,1700"], ["large-phone", "390,1700"], ["dark", "1100,1400"], ["narrow-pane", "1100,1700"]]) {
      const url = pathToFileURL(fixture);
      url.searchParams.set("layout", layout);
      const screenshotArgs = [];
      if (process.env.MPA_QA_SCREENSHOTS) {
        mkdirSync(process.env.MPA_QA_SCREENSHOTS, { recursive: true });
        screenshotArgs.push(`--screenshot=${resolve(process.env.MPA_QA_SCREENSHOTS, `settings-${layout}.png`)}`);
      }
      const rendered = execFileSync(browser, [
        "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--no-default-browser-check", "--do-not-de-elevate",
        `--user-data-dir=${join(temporary, `profile-${layout}`)}`, `--window-size=${size}`, "--virtual-time-budget=7000", "--dump-dom",
        ...screenshotArgs, url.href,
      ], { encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] });
      const result = rendered.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
      assert.match(result || "", /^PASS:/, `${layout}: ${result || "Browser produced no verification result"}`);
    }
  } finally {
    if (dirname(temporary) === tempRoot && basename(temporary).startsWith("mpa-settings-test-")) {
      try { rmSync(temporary, { recursive: true, force: true }); } catch { /* Chrome may briefly retain a file handle. */ }
    }
  }
});

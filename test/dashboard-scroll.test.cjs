const test = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, mkdtempSync, rmSync } = require("node:fs");
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
  } else if (process.platform === "darwin") {
    candidates.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
  } else {
    for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
      const result = spawnSync("which", [name], { encoding: "utf8" });
      if (result.status === 0) candidates.push(result.stdout.trim());
    }
  }
  return candidates.find((path) => path && existsSync(path));
}

test("history controls retain their position through redraws and delayed clouds in a browser", (t) => {
  const browser = findBrowser();
  if (!browser) {
    if (process.env.MPA_REQUIRE_BROWSER === "1") throw new Error("Chrome or Chromium is required for this test run");
    return t.skip("Chrome or Chromium not available; browser regression was not run");
  }
  execFileSync(process.execPath, [join(root, "scripts/build.cjs")], { cwd: root });
  const tempRoot = resolve(tmpdir());
  const profile = resolve(mkdtempSync(join(tempRoot, "mpa-scroll-test-")));
  try {
    for (const layout of ["desktop", "mobile"]) {
      const url = pathToFileURL(join(__dirname, "fixtures/dashboard-scroll.html"));
      url.searchParams.set("layout", layout);
      const html = execFileSync(browser, [
        "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--no-default-browser-check", "--do-not-de-elevate",
        `--user-data-dir=${profile}`, "--virtual-time-budget=5000", "--dump-dom", url.href,
      ], { encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] });
      const result = html.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
      assert.match(result || "", /^PASS:/, `${layout}: ${result || "Browser did not report a result"}`);
    }
  } finally {
    if (dirname(profile) === tempRoot && basename(profile).startsWith("mpa-scroll-test-")) {
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* Browser may briefly retain its profile. */ }
    }
  }
});

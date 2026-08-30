import { spawnSync, spawn } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";

/** Kill any process on a given port. */
function killPort(port) {
  spawnSync("sh", [
    "-c",
    `lsof -ti:${port} 2>/dev/null | while read p; do kill -9 "$p" 2>/dev/null; done`,
  ]);
}

/** Poll a URL until it responds, with a timeout. */
async function waitForURL(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (res.ok || res.status === 404) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`${url} did not respond within ${timeoutMs}ms`);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const checks = [
  ["Formatting", ["run", "format:check"]],
  ["Astro and TypeScript checks", ["run", "check"]],
  ["Production build", ["run", "build"]],
  ["Browser behavior tests", ["run", "test:e2e"]],
];

console.log("\nEngineering Journal verification\n");
console.log("=== Clean generated output ===");
rmSync("dist", { recursive: true, force: true });
rmSync(".astro", { recursive: true, force: true });
console.log("=== Clean generated output: PASS ===");

for (const [label, args] of checks) {
  // For browser tests: start the preview server explicitly and let Playwright
  // reuse it. This avoids subprocess chain issues with spawnSync.
  let previewProc = null;
  if (label === "Browser behavior tests") {
    killPort(4322);
    previewProc = spawn(npm, ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4322"], {
      stdio: "ignore",
      detached: false,
    });
    await waitForURL("http://127.0.0.1:4322/engineering-journal/");
  }

  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npm, args, {
    env: {
      ...process.env,
      // Tell Playwright to reuse the server we just started.
      ...(label === "Browser behavior tests"
        ? { PLAYWRIGHT_SERVER: "preview", PLAYWRIGHT_REUSE: "1" }
        : {}),
    },
    stdio: "inherit",
  });

  if (previewProc) previewProc.kill();

  if (result.error) {
    console.error(`\n${label} could not start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\nVerification stopped: ${label} failed.`);
    process.exit(result.status ?? 1);
  }

  console.log(`=== ${label}: PASS ===`);

  if (label === "Production build") {
    try {
      const searchIndex = JSON.parse(readFileSync("dist/pagefind/pagefind-entry.json", "utf8"));
      const pageCount = Object.values(searchIndex.languages ?? {}).reduce(
        (total, language) => total + Number(language.page_count ?? 0),
        0,
      );

      if (pageCount === 0) throw new Error("Pagefind generated an empty index");
      console.log(`=== Search index: PASS (${pageCount} pages) ===`);
    } catch (error) {
      console.error(`\nSearch index validation failed: ${error.message}`);
      process.exit(1);
    }
  }
}

console.log("\n=== VERIFY: ALL GREEN ===\n");

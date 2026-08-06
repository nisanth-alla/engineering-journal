import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";

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
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npm, args, {
    env: {
      ...process.env,
      ...(label === "Browser behavior tests" ? { PLAYWRIGHT_SERVER: "preview" } : {}),
    },
    stdio: "inherit",
  });

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

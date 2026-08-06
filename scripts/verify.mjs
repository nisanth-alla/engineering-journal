import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const checks = [
  ["Formatting", ["run", "format:check"]],
  ["Astro and TypeScript checks", ["run", "check"]],
  ["Production build", ["run", "build"]],
  ["Browser behavior tests", ["run", "test:e2e"]],
];

console.log("\nEngineering Journal verification\n");

for (const [label, args] of checks) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npm, args, {
    env: process.env,
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
}

console.log("\n=== VERIFY: ALL GREEN ===\n");

import { expect, test, type Page } from "@playwright/test";

async function openDemo(page: Page, path: string) {
  await page.goto(path.slice(1));
  const island = page
    .locator("astro-island")
    .filter({ has: page.locator(".interactive-demo") })
    .first();
  await expect(island).toBeVisible();
  await expect(island).not.toHaveAttribute("ssr", "");
}

test("event loop advances one tick", async ({ page }) => {
  await openDemo(page, "/javascript/how-js-works/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".demo-step-count").first()).toContainText("Step 1/");
  await expect(page.locator(".queue-box").first()).not.toContainText("empty");
});

test("closure scope chain advances", async ({ page }) => {
  await openDemo(page, "/javascript/closures-and-scope/");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".demo-step-count").first()).toContainText("Step 2/");
  await expect(page.locator(".demo-scope-chain")).toBeVisible();
});

test("promise timeline reveals an execution step", async ({ page }) => {
  await openDemo(page, "/javascript/async-patterns/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".demo-timeline-item").first()).toBeVisible();
});

test("type narrowing reveals the narrowed type", async ({ page }) => {
  await openDemo(page, "/typescript/type-system-mental-model/");
  await page
    .getByRole("button", { name: /Guard:/ })
    .first()
    .click();
  await expect(page.getByText("Narrowed type:")).toBeVisible();
});

test("generic playground reveals inference", async ({ page }) => {
  await openDemo(page, "/typescript/generics/");
  await page.getByRole("button", { name: "Mapped return", exact: true }).click();
  await page.locator(".demo-full-width").filter({ hasText: "wrapInArray" }).first().click();
  await expect(page.getByText("Inferred:")).toBeVisible();
});

test("hooks timeline records an increment", async ({ page }) => {
  await openDemo(page, "/react/hooks-from-scratch/");
  await page.getByRole("button", { name: /Increment/ }).click();
  await expect(page.locator(".timeline-entry").first()).toContainText("render");
});

test("render tree updates the parent", async ({ page }) => {
  await openDemo(page, "/react/rendering-and-reconciliation/");
  await page.getByRole("button", { name: /Update parent state/ }).click();
  await expect(page.getByText(/parentCount:/)).toContainText("1");
  await expect(page.locator(".demo-component.highlight").first()).toBeVisible();
});

test("memo comparison reports the parent update", async ({ page }) => {
  await openDemo(page, "/react/performance/");
  await page.getByRole("button", { name: /Update parent state/ }).click();
  await expect(page.getByText("What's happening:")).toBeVisible();
  await expect(page.getByText(/Parent rendered/)).toBeVisible();
});

test("Next rendering trace advances", async ({ page }) => {
  await openDemo(page, "/nextjs/how-nextjs-works/");
  await page.getByRole("button", { name: "Start trace", exact: true }).click();
  await expect(page.locator(".demo-step-count").first()).toContainText("Step 1 of 4");
});

test("Node event loop phase opens details", async ({ page }) => {
  await openDemo(page, "/node/event-loop-deep-dive/");
  await page.getByRole("button", { name: /Timers/ }).click();
  await expect(page.locator(".demo-output")).toContainText("Timers");
});

test("stream pipeline starts", async ({ page }) => {
  await openDemo(page, "/node/streams-and-buffers/");
  await page.getByRole("button", { name: "Start pipeline", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();
});

test("index visualizer shows sequential scan steps", async ({ page }) => {
  await openDemo(page, "/databases/indexing/");
  await page.getByRole("button", { name: "Sequential scan", exact: true }).click();
  await expect(page.getByRole("button", { name: "Read next row", exact: true })).toBeVisible();
  // startMode sets step=0 (1 row read); each click advances by one
  await page.getByRole("button", { name: "Read next row", exact: true }).click();
  const readCount = await page.locator(".iv-row.is-read").count();
  expect(readCount).toBeGreaterThanOrEqual(2);
});

test("interview lab changes the selected tradeoff", async ({ page }) => {
  await openDemo(page, "/interview/system-design/");
  await page.locator(".demo-choice").filter({ hasText: "Put it in a global store" }).click();
  await expect(page.locator(".demo-choice.is-selected")).toContainText("global store");
  await expect(page.getByText(/global store can coordinate/)).toBeVisible();
});

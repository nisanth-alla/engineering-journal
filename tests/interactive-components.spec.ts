import { expect, test } from "@playwright/test";

const interactivePages = [
  "/javascript/how-js-works/",
  "/javascript/closures-and-scope/",
  "/javascript/async-patterns/",
  "/typescript/type-system-mental-model/",
  "/typescript/generics/",
  "/react/hooks-from-scratch/",
  "/react/rendering-and-reconciliation/",
  "/react/performance/",
  "/nextjs/how-nextjs-works/",
  "/node/event-loop-deep-dive/",
  "/node/streams-and-buffers/",
  "/interview/system-design/",
];

for (const path of interactivePages) {
  test(`renders the interactive component on ${path}`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto(`/engineering-journal${path}`);
    const demo = page.locator(".interactive-demo").first();

    await expect(demo).toBeVisible();
    await expect(demo.locator("button").first()).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}

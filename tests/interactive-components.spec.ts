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
  "/databases/indexing/",
];

for (const path of interactivePages) {
  test(`renders the interactive component on ${path}`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto(path.slice(1));
    const island = page
      .locator("astro-island")
      .filter({ has: page.locator(".interactive-demo") })
      .first();

    if ((await island.count()) === 0 && pageErrors.length > 0) {
      throw new Error(
        `React island failed to hydrate: ${pageErrors.map((error) => error.message).join(" | ")}`,
      );
    }
    await expect(island).toBeVisible();
    await expect(island).not.toHaveAttribute("ssr", "");
    const demo = island.locator(".interactive-demo");
    await expect(demo).toBeVisible();
    await expect(demo.locator("button").first()).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}

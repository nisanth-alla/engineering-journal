import { defineConfig, devices } from "@playwright/test";

const usePreviewServer = process.env.PLAYWRIGHT_SERVER === "preview";
const serverPort = usePreviewServer ? 4322 : 4321;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${serverPort}/engineering-journal/`,
    trace: "on-first-retry",
  },
  expect: {
    timeout: 15_000,
  },
  webServer: {
    command: usePreviewServer
      ? `npm run preview -- --host 127.0.0.1 --port ${serverPort}`
      : "npm run dev -- --host 127.0.0.1",
    url: `http://127.0.0.1:${serverPort}/engineering-journal/`,
    reuseExistingServer: usePreviewServer ? false : !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

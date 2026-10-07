import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: false,
  use: {
    baseURL: process.env.RAVEL_TEST_URL || "http://127.0.0.1:8000",
    headless: true,
    screenshot: "off",
    trace: "off",
    launchOptions: {
      executablePath:
        process.env.RAVEL_CHROME ||
        (process.platform === "win32"
          ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
          : undefined),
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
});

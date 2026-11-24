import { defineConfig, devices } from "@playwright/test";

const ci = Boolean(process.env.CI);

const url = "http://127.0.0.1:4321/getmath/";

// The tests open the production build, which `pnpm test` makes first.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: ci,
  reporter: ci ? [["list"], ["github"]] : "list",
  use: { baseURL: url },
  webServer: {
    // Without --ignore-lock, Astro moves the server to the background when an
    // AI assistant runs the tests, and Playwright takes that for a crash.
    command: "pnpm preview --ignore-lock",
    url,
  },
  projects: [
    { name: "build", testMatch: ["build.spec.ts", "notices.spec.ts"] },
    { name: "chromium", testMatch: "site.spec.ts", use: devices["Desktop Chrome"] },
    { name: "firefox", testMatch: "site.spec.ts", use: devices["Desktop Firefox"] },
    { name: "webkit", testMatch: "site.spec.ts", use: devices["Desktop Safari"] },
  ],
});

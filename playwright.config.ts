import { defineConfig, devices } from "@playwright/test";

const ci = Boolean(process.env.CI);

// The tests open the production build, so run `pnpm build` first.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: ci,
  reporter: ci ? [["list"], ["github"]] : "list",
  use: { baseURL: "http://127.0.0.1:4321/getmath/" },
  webServer: {
    // Without --ignore-lock, Astro moves the server to the background when an
    // AI assistant runs the tests, and Playwright takes that for a crash.
    command: "pnpm preview --ignore-lock",
    url: "http://127.0.0.1:4321/getmath/",
  },
  projects: [
    { name: "build", testMatch: "build.spec.ts" },
    { name: "chromium", testMatch: "site.spec.ts", use: devices["Desktop Chrome"] },
    { name: "firefox", testMatch: "site.spec.ts", use: devices["Desktop Firefox"] },
    { name: "webkit", testMatch: "site.spec.ts", use: devices["Desktop Safari"] },
  ],
});

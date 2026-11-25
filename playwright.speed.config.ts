import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config.ts";

// The speed tests run alone, because tests beside them would slow the page they time.
// `pnpm test` runs this configuration after the other one.
export default defineConfig({
  ...base,
  fullyParallel: false,
  projects: [{ name: "speed", testMatch: "speed/speed.spec.ts", use: devices["Desktop Chrome"] }],
});

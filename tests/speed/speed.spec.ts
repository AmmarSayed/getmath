import { chromium, expect, test } from "@playwright/test";
import { describe, measureOnce, measures, medians, over, thresholds, type Measure, type Tamper } from "./measure";

// One browser, and one test at a time: another test running beside these would slow them.
test.describe.configure({ mode: "serial" });

const page = (baseURL: string | undefined) => baseURL!;

test("the page loads fast, stays still and answers the arrows within the ceilings", async ({ baseURL }) => {
  test.setTimeout(90_000);
  const browser = await chromium.launch();
  try {
    const runs = [];
    for (let i = 0; i < thresholds.environment.runsInTest; i++) runs.push(await measureOnce(browser, page(baseURL)));
    const result = medians(runs);
    console.log(`speed, ${runs.length} runs:`);
    for (const m of measures) console.log(`  ${thresholds.measures[m].label}: ${runs.map((r) => +r[m].toFixed(3)).join(", ")}; median ${+result[m].toFixed(3)}; ceiling ${thresholds.measures[m].ceiling}`);
    expect(describe(result, over(result)), `median of ${runs.length} runs, ${thresholds.status}`).toEqual([]);
  } finally {
    await browser.close();
  }
});

// The guard is guarded: each slowdown below is added to the served page, and the same check must see it.
const filler = (bytes: number) => "x".repeat(bytes);
const html = (page: Parameters<Tamper>[0], change: (html: string) => string) =>
  page.route(/\/getmath\/$/, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: change(await response.text()) });
  });

const slowdowns: Record<string, { tamper: Tamper; fails: Measure[]; fine?: Measure[] }> = {
  "a heavy script": {
    tamper: async (p) => {
      await p.route("**/heavy.js", (route) => route.fulfill({ contentType: "text/javascript", body: `//${filler(600_000)}` }));
      await html(p, (text) => text.replace("<head>", '<head><script src="heavy.js"></script>'));
    },
    fails: ["scriptBytes", "bytes"],
  },
  "a script that blocks the first paint": {
    // Files that routing answers do not pass the throttled network, so the wait is made with the processor.
    tamper: (p) => p.addInitScript(() => { for (const end = performance.now() + 3000; performance.now() < end; ); }),
    fails: ["lcp"],
  },
  "a large picture": {
    tamper: async (p) => {
      await p.route("**/big.png", (route) => route.fulfill({ contentType: "image/png", body: filler(1_500_000) }));
      await html(p, (text) => text.replace("</body>", '<img src="big.png" width="1" height="1" alt=""></body>'));
    },
    fails: ["bytes"],
    fine: ["scriptBytes"],
  },
  "busy time in every input event": {
    tamper: (p) =>
      p.addInitScript(() => {
        const busy = () => {
          for (const end = performance.now() + 150; performance.now() < end; );
        };
        addEventListener("keydown", busy, true);
        addEventListener("pointermove", busy, true);
      }),
    fails: ["keyMedian", "dragMedian"],
  },
  "a layout shift": {
    tamper: (p) =>
      p.addInitScript(() => {
        addEventListener("DOMContentLoaded", () => {
          setTimeout(() => {
            const gap = document.createElement("div");
            gap.style.height = "300px";
            document.body.prepend(gap);
          }, 300);
        });
      }),
    fails: ["cls"],
  },
};

for (const [name, { tamper, fails, fine = [] }] of Object.entries(slowdowns)) {
  test(`${name} is caught`, async ({ baseURL }) => {
    test.setTimeout(90_000);
    const browser = await chromium.launch();
    try {
      const result = await measureOnce(browser, page(baseURL), tamper);
      const caught = over(result);
      expect(caught, describe(result, over(result)).join("; ")).toEqual(expect.arrayContaining(fails));
      for (const measure of fine) expect(caught).not.toContain(measure);
    } finally {
      await browser.close();
    }
  });
}

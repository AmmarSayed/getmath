import { chromium, expect, test } from "@playwright/test";
import { describe, measureOnce, measures, medians, over, thresholds, type Measure, type Tamper } from "./measure";

// One browser, and one test at a time: another test running beside these would slow them.
test.describe.configure({ mode: "serial" });

test("the page loads fast, stays still and answers the arrows within the ceilings", async ({ baseURL }) => {
  test.setTimeout(90_000);
  const browser = await chromium.launch();
  try {
    const runs = [];
    for (let i = 0; i < thresholds.environment.runsInTest; i++) runs.push(await measureOnce(browser, baseURL!));
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
// Chrome does not count a picture with almost nothing in it as the largest contentful paint, so this one is full of small squares.
const squares = Array.from({ length: 150 }, (_, i) => `<rect x="${(i * 97) % 580}" y="${(i * 53) % 380}" width="20" height="20" fill="hsl(${(i * 37) % 360} 70% 50%)"/>`).join("");
const picture = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">${squares}</svg>`;
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
  "a large picture that appears late": {
    // The picture is at the top, where it is seen. The handler waits, because files that routing answers do not pass the throttled network.
    tamper: async (p) => {
      await p.route("**/late.svg", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await route.fulfill({ contentType: "image/svg+xml", body: picture });
      });
      await html(p, (text) => text.replace(/<body[^>]*>/, (body) => `${body}<img src="late.svg" width="600" height="400" alt="">`));
    },
    fails: ["lcp"],
  },
  "several small files": {
    tamper: async (p) => {
      await p.route("**/dot*.svg", (route) => route.fulfill({ contentType: "image/svg+xml", body: "<svg xmlns='http://www.w3.org/2000/svg'/>" }));
      const dots = [1, 2, 3, 4, 5].map((n) => `<img src="dot${n}.svg" width="1" height="1" alt="">`).join("");
      await html(p, (text) => text.replace("</body>", `${dots}</body>`));
    },
    fails: ["requests"],
    fine: ["scriptBytes", "lcp"],
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
  "one slow step in the keyboard and one in the drag": {
    tamper: (p) =>
      p.addInitScript(() => {
        const spike = (type: string) => {
          let count = 0;
          addEventListener(type, (event) => {
            if (type === "pointermove" && !(event as PointerEvent).buttons) return;
            if (++count !== 8) return;
            for (const end = performance.now() + 400; performance.now() < end; );
          }, true);
        };
        spike("keydown");
        spike("pointermove");
      }),
    fails: ["keyWorst", "dragWorst"],
    fine: ["keyMedian", "dragMedian"],
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
      const result = await measureOnce(browser, baseURL!, tamper);
      const caught = over(result);
      expect(caught, describe(result, over(result)).join("; ")).toEqual(expect.arrayContaining(fails));
      for (const measure of fine) expect(caught).not.toContain(measure);
    } finally {
      await browser.close();
    }
  });
}

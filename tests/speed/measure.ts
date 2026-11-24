import { readFileSync } from "node:fs";
import type { Browser, Page } from "@playwright/test";

/** The one place that holds the environment, the ceilings and the measurements behind them. */
export const thresholds = JSON.parse(readFileSync(new URL("./thresholds.json", import.meta.url), "utf8")) as Thresholds;

type Stat = { runs: number; min: number; median: number; max: number };
type Spec = { label: string; unit: string; deterministic: boolean; ceiling: number; why: string; measured: Record<"developer" | "runner", Stat & { where: string }> };
export type Thresholds = {
  status: string;
  environment: {
    description: string;
    viewport: { width: number; height: number };
    latencyMs: number;
    downloadKbps: number;
    uploadKbps: number;
    cpuSlowdown: number;
    keySteps: number;
    dragSteps: number;
    runsInTest: number;
  };
  measures: Record<Measure, Spec>;
};

export const measures = ["lcp", "cls", "bytes", "scriptBytes", "requests", "keyWorst", "keyMedian", "dragWorst", "dragMedian"] as const;
export type Measure = (typeof measures)[number];
export type Result = Record<Measure, number>;

/** Page changes that make a page slower on purpose, to show that the check fails. */
export type Tamper = (page: Page) => Promise<unknown>;

declare global {
  interface Window {
    probe: { lcp: number; shifts: [number, number][]; keys: number[]; drags: number[]; timed: number[] };
  }
}

// Runs before the page's own scripts. Event Timing covers the keyboard (rounded to 8 ms, and only
// events slower than 16 ms are reported). It does not cover pointermove, so the drag is timed from
// the event to the first frame and the task after it, which is when the new picture is on the screen.
const probe = () => {
  const p: Window["probe"] = (window.probe = { lcp: 0, shifts: [], keys: [], drags: [], timed: [] });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) p.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; startTime: number }[])
      if (!entry.hadRecentInput) p.shifts.push([entry.startTime, entry.value]);
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (entry.name === "keydown") p.timed.push(entry.duration);
  }).observe({ type: "event", durationThreshold: 16, buffered: true } as PerformanceObserverInit);
  const after = (kind: "keys" | "drags") => (event: Event) => {
    const start = event.timeStamp;
    requestAnimationFrame(() => setTimeout(() => p[kind].push(performance.now() - start)));
  };
  addEventListener("keydown", after("keys"), true);
  addEventListener("pointermove", after("drags"), true);
};

/** The largest burst of shifts, where shifts less than a second apart, and a burst of at most five seconds, belong together. */
function cumulativeShift(shifts: [number, number][]) {
  let worst = 0;
  let sum = 0;
  let first = 0;
  let last = 0;
  for (const [time, value] of shifts) {
    if (time - last > 1000 || time - first > 5000) [sum, first] = [0, time];
    sum += value;
    last = time;
    worst = Math.max(worst, sum);
  }
  return worst;
}

export const middle = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const half = sorted.length >> 1;
  return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
};

/** One cold run: a new browser context, a throttled network and processor, a load, then arrow steps. */
export async function measureOnce(browser: Browser, url: string, tamper?: Tamper): Promise<Result> {
  const { environment: env } = thresholds;
  const context = await browser.newContext({ viewport: env.viewport });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const types = new Map<string, string>();
  const sizes = new Map<string, number>();
  cdp.on("Network.requestWillBeSent", (e) => types.set(e.requestId, e.type ?? "Other"));
  cdp.on("Network.loadingFinished", (e) => sizes.set(e.requestId, e.encodedDataLength));
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: env.latencyMs,
    downloadThroughput: (env.downloadKbps * 1000) / 8,
    uploadThroughput: (env.uploadKbps * 1000) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: env.cpuSlowdown });
  await page.addInitScript(probe);
  await tamper?.(page);

  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
  // Late shifts and the last paint of the largest element.
  await page.waitForTimeout(1000);

  const handle = page.getByRole("slider", { name: "Tip of arrow a" });
  const value = () => handle.getAttribute("aria-valuetext");
  await handle.scrollIntoViewIfNeeded();
  await handle.focus();
  const start = await value();
  for (let i = 0; i < env.keySteps; i++) {
    await page.keyboard.press(i % 2 ? "ArrowLeft" : "ArrowRight");
    if (i === 0) if ((await value()) === start) throw new Error("The keyboard steps did not move the arrow, so nothing was measured");
    await page.waitForTimeout(40);
  }

  // A circle round the middle of the grid, one pointer move at a time, as a hand would.
  const axes = (await page.locator(".interaction:has(svg) .axes").boundingBox())!;
  const [cx, cy, radius] = [axes.x + axes.width / 2, axes.y + axes.height / 2, axes.width / 4];
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const before = await value();
  let moved = false;
  for (let i = 0; i <= env.dragSteps; i++) {
    const angle = (i / env.dragSteps) * 2 * Math.PI;
    await page.mouse.move(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    await page.waitForTimeout(20);
    moved ||= (await value()) !== before;
  }
  if (!moved) throw new Error("The drag did not move the arrow, so nothing was measured");
  await page.mouse.up();
  await page.waitForTimeout(300);

  const seen = await page.evaluate(() => window.probe);
  await cdp.send("Network.disable");
  await context.close();

  let bytes = 0;
  let scriptBytes = 0;
  for (const [id, size] of sizes) {
    bytes += size;
    if (types.get(id) === "Script") scriptBytes += size;
  }
  // Moves from the press onwards are the drag, and the keys never hold the pointer down.
  const drags = seen.drags.slice(-env.dragSteps);
  if (seen.keys.length !== env.keySteps) throw new Error(`${seen.keys.length} keyboard samples, not ${env.keySteps}`);
  if (drags.length !== env.dragSteps) throw new Error(`${drags.length} drag samples, not ${env.dragSteps}`);
  if (!(seen.lcp > 0)) throw new Error("No largest contentful paint was seen");
  if (!(scriptBytes > 0)) throw new Error("No script bytes were seen");
  return {
    lcp: seen.lcp,
    cls: cumulativeShift(seen.shifts),
    bytes,
    scriptBytes,
    requests: sizes.size,
    keyWorst: Math.max(0, ...seen.timed),
    keyMedian: middle(seen.keys),
    dragWorst: Math.max(...drags),
    dragMedian: middle(drags),
  };
}

/** The median of repeated runs, so that one noisy run cannot fail a pull request. */
export function medians(runs: Result[]): Result {
  return Object.fromEntries(measures.map((m) => [m, middle(runs.map((r) => r[m]))])) as Result;
}

/** The measures that are over their ceiling. */
export const over = (result: Result) => measures.filter((m) => result[m] > thresholds.measures[m].ceiling);

/** Says how far each of these measures is over its ceiling. */
export const describe = (result: Result, names: readonly Measure[]) =>
  names.map((m) => `${thresholds.measures[m].label} is ${+result[m].toFixed(3)} ${thresholds.measures[m].unit}, over the ceiling of ${thresholds.measures[m].ceiling}`);
